#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    Manager, SystemTray, SystemTrayEvent,
    SystemTrayMenu, SystemTrayMenuItem, CustomMenuItem, GlobalShortcutManager,
    WindowEvent, PhysicalPosition
};
use std::sync::atomic::{AtomicBool, Ordering};
use std::fs;
use std::path::PathBuf;
use tauri::api::path::app_data_dir;

// 窗口可见状态
static WINDOW_VISIBLE: AtomicBool = AtomicBool::new(false);

fn get_data_dir(app: &tauri::AppHandle) -> PathBuf {
    let dir = app_data_dir(&app.config()).unwrap_or_else(|| PathBuf::from("."));
    let data_dir = dir.join("sakura-search");
    let _ = fs::create_dir_all(&data_dir);
    data_dir
}

#[tauri::command]
fn read_history(app: tauri::AppHandle) -> Result<String, String> {
    let path = get_data_dir(&app).join("history.json");
    if path.exists() {
        fs::read_to_string(&path).map_err(|e| e.to_string())
    } else {
        Ok("[]".to_string())
    }
}

#[tauri::command]
fn write_history(app: tauri::AppHandle, data: String) -> Result<(), String> {
    let path = get_data_dir(&app).join("history.json");
    fs::write(&path, data).map_err(|e| e.to_string())
}

#[tauri::command]
fn read_knowledge(app: tauri::AppHandle) -> Result<String, String> {
    let path = get_data_dir(&app).join("knowledge.json");
    if path.exists() {
        fs::read_to_string(&path).map_err(|e| e.to_string())
    } else {
        Ok("[]".to_string())
    }
}

#[tauri::command]
fn write_knowledge(app: tauri::AppHandle, data: String) -> Result<(), String> {
    let path = get_data_dir(&app).join("knowledge.json");
    fs::write(&path, data).map_err(|e| e.to_string())
}

#[tauri::command]
fn read_settings(app: tauri::AppHandle) -> Result<String, String> {
    let path = get_data_dir(&app).join("settings.json");
    if path.exists() {
        fs::read_to_string(&path).map_err(|e| e.to_string())
    } else {
        Ok("{}".to_string())
    }
}

#[tauri::command]
fn write_settings(app: tauri::AppHandle, data: String) -> Result<(), String> {
    let path = get_data_dir(&app).join("settings.json");
    fs::write(&path, data).map_err(|e| e.to_string())
}

#[tauri::command]
fn check_due_reviews(app: tauri::AppHandle) -> Result<u32, String> {
    let path = get_data_dir(&app).join("history.json");
    if !path.exists() {
        return Ok(0);
    }

    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let records: Vec<serde_json::Value> = serde_json::from_str(&content).unwrap_or_default();

    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis() as i64;

    let due_count = records.iter().filter(|r| {
        r.get("nextReviewAt")
            .and_then(|v| v.as_i64())
            .map(|t| t <= now)
            .unwrap_or(false)
    }).count() as u32;

    Ok(due_count)
}

#[tauri::command]
fn send_review_notification(app: tauri::AppHandle, count: u32) -> Result<(), String> {
    tauri::api::notification::Notification::new(&app.config().tauri.bundle.identifier)
        .title("🌸 樱搜复习提醒")
        .body(&format!("你有 {} 条知识待复习", count))
        .show()
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn update_global_shortcut(app: tauri::AppHandle, old_shortcut: String, new_shortcut: String) -> Result<(), String> {
    let mut manager = app.global_shortcut_manager();

    // 注销旧快捷键
    if manager.is_registered(&old_shortcut).unwrap_or(false) {
        manager.unregister(&old_shortcut).map_err(|e| e.to_string())?;
    }

    // 注册新快捷键
    let window = app.get_window("main").unwrap();
    manager.register(&new_shortcut, move || {
        toggle_window(&window);
    }).map_err(|e| e.to_string())?;

    Ok(())
}

fn main() {
    // 创建系统托盘菜单
    let quit = CustomMenuItem::new("quit", "退出");
    let show = CustomMenuItem::new("show", "显示窗口");
    let hide = CustomMenuItem::new("hide", "隐藏窗口");

    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_item(hide)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    let system_tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .setup(|app| {
            // 获取主窗口
            let window = app.get_window("main").unwrap();

            // 设置窗口位置到右下角
            position_window_to_bottom_right(&window);

            // 初始隐藏窗口
            window.hide().unwrap();
            WINDOW_VISIBLE.store(false, Ordering::SeqCst);

            // 注册全局快捷键 Alt+Space
            let window_for_shortcut = window.clone();
            app.global_shortcut_manager()
                .register("Alt+Space", move || {
                    toggle_window(&window_for_shortcut);
                })
                .expect("Failed to register global shortcut");

            // 监听窗口事件
            let window_for_event = window.clone();
            window.on_window_event(move |event| {
                match event {
                    WindowEvent::Focused(focused) => {
                        if !focused {
                            // 可选：失去焦点时隐藏
                            // hide_window(&window_for_event);
                        }
                    }
                    WindowEvent::CloseRequested { api, .. } => {
                        api.prevent_close();
                        hide_window(&window_for_event);
                    }
                    _ => {}
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            read_history, write_history,
            read_knowledge, write_knowledge,
            read_settings, write_settings,
            check_due_reviews, send_review_notification,
            update_global_shortcut
        ])
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| {
            match event {
                SystemTrayEvent::LeftClick { .. } => {
                    let window = app.get_window("main").unwrap();
                    toggle_window(&window);
                }
                SystemTrayEvent::MenuItemClick { id, .. } => {
                    let window = app.get_window("main").unwrap();
                    match id.as_str() {
                        "quit" => std::process::exit(0),
                        "show" => show_window(&window),
                        "hide" => hide_window(&window),
                        _ => {}
                    }
                }
                _ => {}
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// 将窗口定位到屏幕右下角
fn position_window_to_bottom_right(window: &tauri::Window) {
    if let Ok(monitor) = window.current_monitor() {
        if let Some(monitor) = monitor {
            let size = monitor.size();
            let scale_factor = monitor.scale_factor();

            // 窗口大小
            let window_width = 520.0;
            let window_height = 600.0;

            // 计算右下角位置（留出边距）
            let margin = 24.0;
            let x = size.width as f64 / scale_factor - window_width - margin;
            let y = size.height as f64 / scale_factor - window_height - margin;

            // 设置窗口位置
            let _ = window.set_position(PhysicalPosition::new(x, y));
        }
    }
}

fn toggle_window(window: &tauri::Window) {
    let is_visible = WINDOW_VISIBLE.load(Ordering::SeqCst);
    if is_visible {
        hide_window(window);
    } else {
        show_window(window);
    }
}

fn show_window(window: &tauri::Window) {
    // 每次显示时重新定位到右下角
    position_window_to_bottom_right(window);
    let _ = window.show();
    let _ = window.set_focus();
    WINDOW_VISIBLE.store(true, Ordering::SeqCst);
}

fn hide_window(window: &tauri::Window) {
    let _ = window.hide();
    WINDOW_VISIBLE.store(false, Ordering::SeqCst);
}
