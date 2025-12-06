# i18n Folder Structure

This folder contains the internationalization (i18n) configuration and translations for the application.

## 📁 Directory Structure

```
i18n/
├── config.ts                    # Main i18n configuration
├── README.md                    # Ovaj fajl
└── locales/                     # Prevodi organizovani po jezicima
    ├── en/                      # Engleski prevodi
    │   ├── common.json          # Opšti prevodi
    │   ├── auth.json           # Prijava, odjava, registracija
    │   ├── home.json           # Početna strana
    │   ├── navbar.json         # Navigacija
    │   ├── sidebar.json        # Bočni meni
    │   ├── proizvodi.json      # Proizvodi
    │   ├── korisnici.json      # Korisnici
    │   ├── korpa.json          # Korpa
    │   ├── profil.json         # Profil korisnika
    │   ├── porudzbine.json     # Porudžbine
    │   ├── notFound.json       # 404 strana
    │   └── placanje.json       # Plaćanje
    └── sr/                      # Srpski prevodi (isti fajlovi)
```

## 🔧 Configuration

The main configuration is in `config.ts` which:
- **Jednostavno** - bez komplikovanih konfiguracija
- Podržava `en` (English) i `sr` (Serbian)
- Srpski je glavni jezik
- Organizovano po namespace-ovima (delovima aplikacije)

## 📝 Usage in Components

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  // Load translations from a specific namespace
  const { t } = useTranslation('proizvodi');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

## 🌍 Supported Languages

- **Serbian (sr)** - Default language
- **English (en)** - Secondary language

## 📋 Available Namespaces

1. **common** - General translations used across the app
2. **auth** - Authentication related (login, logout, register)
3. **home** - Home page content
4. **navbar** - Navigation bar
5. **sidebar** - Sidebar menu
6. **proizvodi** - Products/inventory
7. **korisnici** - User management
8. **korpa** - Shopping cart
9. **profil** - User profile
10. **porudzbine** - Orders
11. **notFound** - 404 error page
12. **placanje** - Payment process

## ✨ Prednosti ove strukture

1. **Jednostavnost** - Lako za razumevanje i korišćenje
2. **Organizovanost** - Prevodi grupisani po delovima aplikacije
3. **Lako dodavanje** - Novi jezik = novi folder
4. **Čist kod** - Bez komplikovanih konfiguracija

## 🔄 Adding New Translations

### Adding a New Language
1. Create a new folder in `locales/` (e.g., `locales/de/`)
2. Copy all JSON files from an existing language folder
3. Translate the content while keeping the same JSON structure
4. Update the `SupportedLanguage` type in `config.ts`

### Adding a New Namespace
1. Create new JSON files in each language folder (e.g., `blog.json`)
2. Add the namespace to the import list in `config.ts`
3. Add it to the resources configuration
4. Update the namespaces array in i18nConfig

## 🎯 Migration from Old Structure

The old structure had all translation files in the root `i18n/` folder:
- `en.json`, `sr.json` → moved to `locales/en/common.json`, `locales/sr/common.json`
- `*_en.json`, `*_sr.json` → moved to `locales/en/*.json`, `locales/sr/*.json`
- Combined `login`, `logout`, `register` → `auth.json`

This new structure provides better maintainability and scalability for the application.
