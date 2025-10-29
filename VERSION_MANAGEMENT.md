# 📌 Version Management Guide

## Current Version: 1.1.0

---

## 📍 Where Version is Displayed

Users can see the version number in two places:

1. **Settings Screen (Cilësimet)**
   - Scroll to the bottom of the Backup tab
   - Shows: "Versioni 1.1.0"

2. **Privacy Screen (Privatësia)**
   - At the bottom of the page
   - Shows: "Versioni 1.1.0"

---

## 🔄 How to Update Version Number

When you make changes and want to release a new version:

### Step 1: Decide Version Number

Follow [Semantic Versioning](https://semver.org/):

- **Major** (1.x.x): Breaking changes, major features
  - Example: `1.1.0` → `2.0.0`
  
- **Minor** (x.1.x): New features, no breaking changes
  - Example: `1.1.0` → `1.2.0`
  
- **Patch** (x.x.1): Bug fixes only
  - Example: `1.1.0` → `1.1.1`

### Step 2: Update Files

You need to update **4 files**:

#### 1. `package.json`
```json
{
  "version": "1.2.0"  // Update this line
}
```

#### 2. `src/components/SettingsScreen.tsx`
Around line **689**, change:
```tsx
<div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#4CAF50', marginBottom: '0.5rem' }}>
  Versioni 1.2.0  // Update this
</div>
```

#### 3. `src/components/PrivacyScreen.tsx`
Around line **137**, change:
```tsx
<div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#4CAF50', marginBottom: '0.5rem' }}>
  Versioni 1.2.0  // Update this
</div>
```

#### 4. `CHANGELOG.md`
Add a new entry at the top:
```markdown
## [1.2.0] - 2024-11-XX

### 🎉 New Features
- Feature description here

### 🐛 Bug Fixes
- Fix description here

### 🔧 Improvements
- Improvement description here
```

### Step 3: Commit and Push

```bash
git add .
git commit -m "v1.2.0 - Description of changes"
git push origin main
```

### Step 4: Automatic Deployment

Vercel will automatically:
1. Detect the push
2. Build the new version
3. Deploy it to production
4. Users will see the new version number!

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2024-10-28 | Initial production release with all fixes |
| 1.1.1 | 2024-10-29 | Added version display, removed personal data |

---

## 💡 Tips

### When to Increment:

- **Patch (1.1.X)**: Small bug fixes, typo corrections, minor tweaks
- **Minor (1.X.0)**: New features, new screens, significant improvements
- **Major (X.0.0)**: Complete redesign, breaking changes, major architecture changes

### Best Practices:

1. **Always update CHANGELOG.md** - Users want to know what changed
2. **Test before deploying** - Run `npm run build` locally first
3. **Use descriptive commit messages** - "v1.2.0 - Added dark mode support"
4. **Keep version numbers consistent** - Update all 4 files at once

### Quick Check:

Before pushing, verify version is updated in:
- [ ] `package.json`
- [ ] `src/components/SettingsScreen.tsx`
- [ ] `src/components/PrivacyScreen.tsx`
- [ ] `CHANGELOG.md`

Then run:
```bash
npm run build  # Make sure it compiles
git status     # Check what's changed
```

---

## 🚀 How Users See Updates

1. **User visits the app** (already deployed)
2. **Vercel serves new version** automatically
3. **PWA updates in background** (service worker)
4. **User refreshes or restarts** the app
5. **New version is active!**

Users can check their version by going to:
- **Cilësimet** (Settings) → Scroll to bottom
- **Privatësia** (Privacy) → Scroll to bottom

---

## 🎯 Future Enhancements

Consider adding:
- [ ] "Update available" notification
- [ ] Automatic refresh prompt for new versions
- [ ] Version changelog viewer in-app
- [ ] "What's new" popup on version change

---

**Last Updated:** October 29, 2024  
**Current Version:** 1.1.0

