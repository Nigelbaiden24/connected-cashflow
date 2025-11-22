# Translation System Guide

This application now includes a comprehensive AI-powered translation system that automatically translates all content to the user's selected language.

## How It Works

1. **Translation Context**: A global context manages the current language and provides translation functions
2. **AI Translation**: Uses Lovable AI to translate content on-demand
3. **Caching**: Translations are cached in memory to avoid repeated API calls
4. **Batch Processing**: Multiple translation requests are batched together for efficiency

## For Users

1. Go to Settings → Language
2. Select your preferred language from the dropdown
3. Click "Save Language Preference"
4. The page will reload and all content will be translated

## For Developers

### Using TranslatedText Component (Recommended)

The easiest way to make text translatable is to use the `TranslatedText` component:

```tsx
import { TranslatedText } from "@/components/TranslatedText";

// Basic usage
<TranslatedText>Hello, World!</TranslatedText>

// With custom element
<TranslatedText as="h1" className="text-3xl font-bold">
  Welcome to FlowPulse
</TranslatedText>

// With paragraph
<TranslatedText as="p" className="text-muted-foreground">
  This is a description
</TranslatedText>
```

### Using the Translation Hook

For more control, use the `useTranslation` hook directly:

```tsx
import { useTranslation } from "@/contexts/TranslationContext";

function MyComponent() {
  const { t, language, isTranslating } = useTranslation();
  
  return (
    <div>
      <h1>{t("Dashboard")}</h1>
      <p>{t("Current language")}: {language}</p>
      {isTranslating && <Loader />}
    </div>
  );
}
```

### Best Practices

1. **Wrap all user-facing text**: Any text that users see should be wrapped with `TranslatedText` or passed through `t()`
2. **Keep text simple**: Avoid complex formatting in translatable strings
3. **Use placeholders for dynamic content**: 
   ```tsx
   t(`You have ${count} messages`) // Good
   ```
4. **Don't translate**: 
   - Technical terms (API, URL, etc.)
   - Brand names (FlowPulse)
   - Code snippets
   - File names

### Supported Languages

- English (en) - Default
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Russian (ru)
- Japanese (ja)
- Korean (ko)
- Chinese Simplified (zh)
- Arabic (ar)
- Hindi (hi)
- Turkish (tr)
- Dutch (nl)
- Polish (pl)
- Swedish (sv)
- Danish (da)
- Finnish (fi)
- Norwegian (no)
- Czech (cs)
- Twi (tw)
- Yoruba (yo)
- Igbo (ig)
- Hausa (ha)
- Swahili (sw)
- Zulu (zu)
- Xhosa (xh)
- Amharic (am)
- Somali (so)
- Afrikaans (af)

## Examples

### Example 1: Navigation Menu

```tsx
import { TranslatedText } from "@/components/TranslatedText";

const NavMenu = () => (
  <nav>
    <TranslatedText as="a" className="nav-link">Home</TranslatedText>
    <TranslatedText as="a" className="nav-link">Dashboard</TranslatedText>
    <TranslatedText as="a" className="nav-link">Settings</TranslatedText>
  </nav>
);
```

### Example 2: Button with Translation

```tsx
import { useTranslation } from "@/contexts/TranslationContext";
import { Button } from "@/components/ui/button";

const MyButton = () => {
  const { t } = useTranslation();
  
  return (
    <Button onClick={handleClick}>
      {t("Save Changes")}
    </Button>
  );
};
```

### Example 3: Form Labels

```tsx
import { TranslatedText } from "@/components/TranslatedText";
import { Label } from "@/components/ui/label";

<div>
  <Label>
    <TranslatedText>Email Address</TranslatedText>
  </Label>
  <Input type="email" placeholder={t("Enter your email")} />
</div>
```

## Performance Considerations

- Translations are batched and cached
- Only new strings are sent for translation
- The system uses a 100ms debounce to group translation requests
- Cached translations persist across re-renders

## Troubleshooting

**Text not translating?**
- Make sure it's wrapped with `TranslatedText` or passed through `t()`
- Check the browser console for errors
- Verify the edge function is deployed

**Translations slow?**
- First load will be slower as translations are fetched
- Subsequent loads use cached translations
- Consider pre-translating common strings

**Wrong translations?**
- AI translations may vary slightly
- Context is important - provide clear, complete sentences
- Report issues for improvement
