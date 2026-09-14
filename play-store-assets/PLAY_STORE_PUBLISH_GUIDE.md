# Google Play Store Release Guide: Box Blast 2D

This guide walks you through publishing **Box Blast 2D** to the Google Play Store using your **Flutter Web Shell**.

---

## 📦 What Has Been Prepared

### 1. Ready-to-Upload Store Graphics (`play-store-assets/`)
All images are rendered to Google Play specifications:
- 🖼️ **App Icon**: [`app_icon_512x512.png`](file:///c:/Users/nextsem/Documents/box-blast-2d/play-store-assets/app_icon_512x512.png) (512×512 PNG, 32-bit, zero transparency, 3D glossy marble design)
- 🎨 **Feature Graphic**: [`feature_graphic_1024x500.png`](file:///c:/Users/nextsem/Documents/box-blast-2d/play-store-assets/feature_graphic_1024x500.png) (1024×500 PNG banner with 3D logo & shockwave beads)
- 📱 **Screenshots** (Full 9:16 vertical phone screenshots):
  1. [`screenshot_1_gameplay.png`](file:///c:/Users/nextsem/Documents/box-blast-2d/play-store-assets/screenshot_1_gameplay.png) — *Core Marble Drag & Drop Gameplay*
  2. [`screenshot_2_combo.png`](file:///c:/Users/nextsem/Documents/box-blast-2d/play-store-assets/screenshot_2_combo.png) — *Dynamic Combo Line Blasts & Shockwaves*
  3. [`screenshot_3_record.png`](file:///c:/Users/nextsem/Documents/box-blast-2d/play-store-assets/screenshot_3_record.png) — *High Score Celebration & Aura Rings*
  4. [`screenshot_4_guide.png`](file:///c:/Users/nextsem/Documents/box-blast-2d/play-store-assets/screenshot_4_guide.png) — *Quick Lessons & How to Play Guide*

### 2. Store Listing Copy (`play-store-assets/store_listing_metadata.md`)
- **Title**: `Box Blast 2D: Block Puzzle` *(27/30 chars)*
- **Short Description**: `Satisfying 2D marble puzzle! Drag shapes, blast lines & chain massive combos.` *(79/80 chars)*
- **Full Description**: Engaging text highlighting offline play, satisfying physics, pentatonic harmonies, and brain training.
- **Privacy Policy URL**: `https://nextsem.online/privacy`

### 3. Flutter Web Shell (`mobile/`)
- Located at: [`c:\Users\nextsem\Documents\box-blast-2d\mobile`](file:///c:/Users/nextsem/Documents/box-blast-2d/mobile)
- **Engine**: `flutter_inappwebview` with internal localhost server for 100% offline 60fps canvas performance and Web Audio API synthesis.
- **Android Target**: Android 14 (API level 34).
- **Application ID**: `online.nextsem.box_blast_2d`
- **Orientation**: Locked to Portrait mode.
- **Icons**: Mipmap icons generated across all densities (`mdpi`, `hdpi`, `xhdpi`, `xxhdpi`, `xxxhdpi`).
- **Code Quality**: `flutter analyze` passed with **0 issues found**!

---

## 🚀 Step-by-Step Google Play Console Submission

### Step 1: Create App in Google Play Console
1. Log in to [Google Play Console](https://play.google.com/console).
2. Click **Create app** (top right).
3. Fill in:
   - **App name**: `Box Blast 2D: Block Puzzle`
   - **Default language**: English (United States)
   - **App or game**: Game
   - **Free or paid**: Free
4. Accept the declarations and click **Create app**.

### Step 2: Main Store Listing
Go to **Grow > Store presence > Main store listing**:
1. Paste **App name**, **Short description**, and **Full description** from `store_listing_metadata.md`.
2. Upload **App icon**: `play-store-assets/app_icon_512x512.png`
3. Upload **Feature graphic**: `play-store-assets/feature_graphic_1024x500.png`
4. Upload **Phone screenshots**: Select the 4 screenshot PNGs from `play-store-assets/`.
5. Click **Save**.

### Step 3: Complete App Content Declarations
Go to **Policy and programs > App content**:
- **Privacy Policy**: Enter `https://nextsem.online/privacy`
- **Ads**: Select *Yes, my app contains ads* (for Rewarded Video revive).
- **App access**: All functionality is available without special access.
- **Content ratings**: Complete questionnaire (select Game > Puzzle/Casual -> Rating: Everyone).
- **Target audience**: Select Age 13 and above (or Everyone).
- **Data safety**: Select *No, this app does not collect or share any user data*.

### Step 4: Build Release App Bundle (.aab)
To build the `.aab` on your PC, run:
```powershell
C:\src\flutter\bin\flutter.bat build appbundle --release
```
The output `.aab` file will be generated at:
`c:\Users\nextsem\Documents\box-blast-2d\mobile\build\app\outputs\bundle\release\app-release.aab`

*(Or push your repository to GitHub to let the GitHub Actions workflow compile it in the cloud!)*

### Step 5: Upload .aab & Submit for Review
1. Go to **Testing > Internal testing** (or **Closed testing** / **Production**).
2. Click **Create new release**.
3. Upload your `.aab` file.
4. Enter release notes (e.g. `Initial release of Box Blast 2D: Glossy 3D Orbs Edition`).
5. Click **Next** $\rightarrow$ **Save and publish**!
