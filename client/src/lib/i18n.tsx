import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'ru' | 'en' | 'pl';

export interface Translations {
  // Navigation & Layout
  dashboard: string;
  playground: string;
  fileManager: string;
  widgetDesigner: string;
  adminPanel: string;
  userProfile: string;
  logout: string;
  
  // Dashboard
  title: string;
  subtitle: string;
  createAssistant: string;
  myAssistants: string;
  noAssistants: string;
  downloadPlatform: string;
  integrations: string;
  chatLogs: string;
  
  // Assistant Management
  assistantName: string;
  instructions: string;
  tools: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  create: string;
  
  // Chat Interface
  typeMessage: string;
  send: string;
  newChat: string;
  exportPdf: string;
  chatHistory: string;
  
  // Authentication
  login: string;
  register: string;
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  admin: string;
  user: string;
  
  // Settings & Download
  settings: string;
  language: string;
  theme: string;
  downloadWindows: string;
  downloadMacOS: string;
  licenseKey: string;
  systemRequirements: string;
  
  // Messages
  success: string;
  error: string;
  loading: string;
  saved: string;
  deleted: string;
  
  // Common
  yes: string;
  no: string;
  ok: string;
  close: string;
  back: string;
  next: string;
  previous: string;
  search: string;
  filter: string;
  
  // File Manager
  uploadFile: string;
  deleteFile: string;
  fileUploaded: string;
  fileDeleted: string;
  
  // Widget Designer
  widgetSettings: string;
  previewWidget: string;
  generateCode: string;
  copyCode: string;
  downloadWidget: string;
}

export const translations: Record<Language, Translations> = {
  ru: {
    dashboard: 'Панель управления',
    playground: 'Чат-площадка',
    fileManager: 'Файлы',
    widgetDesigner: 'Дизайнер виджетов',
    adminPanel: 'Админ-панель',
    userProfile: 'Профиль',
    logout: 'Выйти',
    title: 'Air Lab. Assistant Builder',
    subtitle: 'AI Assistants Platform Initiology AI Systems',
    createAssistant: 'Создать ассистента',
    myAssistants: 'Мои ассистенты',
    noAssistants: 'У вас пока нет ассистентов',
    downloadPlatform: 'Скачать платформу',
    integrations: 'Интеграции',
    chatLogs: 'Логи чатов',
    assistantName: 'Название ассистента',
    instructions: 'Инструкции',
    tools: 'Инструменты',
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    edit: 'Редактировать',
    create: 'Создать',
    typeMessage: 'Введите сообщение...',
    send: 'Отправить',
    newChat: 'Новый чат',
    exportPdf: 'Экспорт в PDF',
    chatHistory: 'История чата',
    login: 'Войти',
    register: 'Регистрация',
    username: 'Имя пользователя',
    password: 'Пароль',
    confirmPassword: 'Подтвердите пароль',
    email: 'Email',
    admin: 'Администратор',
    user: 'Пользователь',
    settings: 'Настройки',
    language: 'Язык',
    theme: 'Тема',
    downloadWindows: 'Скачать для Windows',
    downloadMacOS: 'Скачать для Mac OS',
    licenseKey: 'Лицензионный ключ',
    systemRequirements: 'Системные требования',
    success: 'Успешно',
    error: 'Ошибка',
    loading: 'Загрузка...',
    saved: 'Сохранено',
    deleted: 'Удалено',
    yes: 'Да',
    no: 'Нет',
    ok: 'ОК',
    close: 'Закрыть',
    back: 'Назад',
    next: 'Далее',
    previous: 'Предыдущий',
    search: 'Поиск',
    filter: 'Фильтр',
    uploadFile: 'Загрузить файл',
    deleteFile: 'Удалить файл',
    fileUploaded: 'Файл загружен',
    fileDeleted: 'Файл удален',
    widgetSettings: 'Настройки виджета',
    previewWidget: 'Предпросмотр',
    generateCode: 'Генерировать код',
    copyCode: 'Копировать код',
    downloadWidget: 'Скачать виджет',
  },
  
  en: {
    dashboard: 'Dashboard',
    playground: 'Playground',
    fileManager: 'File Manager',
    widgetDesigner: 'Widget Designer',
    adminPanel: 'Admin Panel',
    userProfile: 'User Profile',
    logout: 'Logout',
    title: 'Air Lab. Assistant Builder',
    subtitle: 'AI Assistants Platform Initiology AI Systems',
    createAssistant: 'Create Assistant',
    myAssistants: 'My Assistants',
    noAssistants: "You don't have any assistants yet",
    downloadPlatform: 'Download Platform',
    integrations: 'Integrations',
    chatLogs: 'Chat Logs',
    assistantName: 'Assistant Name',
    instructions: 'Instructions',
    tools: 'Tools',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    typeMessage: 'Type a message...',
    send: 'Send',
    newChat: 'New Chat',
    exportPdf: 'Export PDF',
    chatHistory: 'Chat History',
    login: 'Login',
    register: 'Register',
    username: 'Username',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    email: 'Email',
    admin: 'Administrator',
    user: 'User',
    settings: 'Settings',
    language: 'Language',
    theme: 'Theme',
    downloadWindows: 'Download for Windows',
    downloadMacOS: 'Download for Mac OS',
    licenseKey: 'License Key',
    systemRequirements: 'System Requirements',
    success: 'Success',
    error: 'Error',
    loading: 'Loading...',
    saved: 'Saved',
    deleted: 'Deleted',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    search: 'Search',
    filter: 'Filter',
    uploadFile: 'Upload File',
    deleteFile: 'Delete File',
    fileUploaded: 'File uploaded',
    fileDeleted: 'File deleted',
    widgetSettings: 'Widget Settings',
    previewWidget: 'Preview Widget',
    generateCode: 'Generate Code',
    copyCode: 'Copy Code',
    downloadWidget: 'Download Widget',
  },
  
  pl: {
    dashboard: 'Panel sterowania',
    playground: 'Plac zabaw',
    fileManager: 'Menedżer plików',
    widgetDesigner: 'Projektant widżetów',
    adminPanel: 'Panel administratora',
    userProfile: 'Profil użytkownika',
    logout: 'Wyloguj',
    title: 'Air Lab. Assistant Builder',
    subtitle: 'AI Assistants Platform Initiology AI Systems',
    createAssistant: 'Utwórz asystenta',
    myAssistants: 'Moi asystenci',
    noAssistants: 'Nie masz jeszcze żadnych asystentów',
    downloadPlatform: 'Pobierz platformę',
    integrations: 'Integracje',
    chatLogs: 'Logi czatu',
    assistantName: 'Nazwa asystenta',
    instructions: 'Instrukcje',
    tools: 'Narzędzia',
    save: 'Zapisz',
    cancel: 'Anuluj',
    delete: 'Usuń',
    edit: 'Edytuj',
    create: 'Utwórz',
    typeMessage: 'Wpisz wiadomość...',
    send: 'Wyślij',
    newChat: 'Nowy czat',
    exportPdf: 'Eksportuj PDF',
    chatHistory: 'Historia czatu',
    login: 'Zaloguj',
    register: 'Zarejestruj',
    username: 'Nazwa użytkownika',
    password: 'Hasło',
    confirmPassword: 'Potwierdź hasło',
    email: 'Email',
    admin: 'Administrator',
    user: 'Użytkownik',
    settings: 'Ustawienia',
    language: 'Język',
    theme: 'Motyw',
    downloadWindows: 'Pobierz dla Windows',
    downloadMacOS: 'Pobierz dla Mac OS',
    licenseKey: 'Klucz licencyjny',
    systemRequirements: 'Wymagania systemowe',
    success: 'Sukces',
    error: 'Błąd',
    loading: 'Ładowanie...',
    saved: 'Zapisano',
    deleted: 'Usunięto',
    yes: 'Tak',
    no: 'Nie',
    ok: 'OK',
    close: 'Zamknij',
    back: 'Wstecz',
    next: 'Dalej',
    previous: 'Poprzedni',
    search: 'Szukaj',
    filter: 'Filtr',
    uploadFile: 'Prześlij plik',
    deleteFile: 'Usuń plik',
    fileUploaded: 'Plik przesłany',
    fileDeleted: 'Plik usunięty',
    widgetSettings: 'Ustawienia widżetu',
    previewWidget: 'Podgląd widżetu',
    generateCode: 'Generuj kod',
    copyCode: 'Kopiuj kod',
    downloadWidget: 'Pobierz widżet',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('air-lab-language');
    return (saved as Language) || 'ru';
  });

  useEffect(() => {
    localStorage.setItem('air-lab-language', language);
  }, [language]);

  const value = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export const languageNames: Record<Language, string> = {
  ru: 'Русский',
  en: 'English',
  pl: 'Polski',
};