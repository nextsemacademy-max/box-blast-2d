using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.UI;
using BoxBlast2D.Core;
using BoxBlast2D.Gameplay;
using BoxBlast2D.Audio;
using BoxBlast2D.Juice;
using BoxBlast2D.Boosters;
using BoxBlast2D.UI;

namespace BoxBlast2D.Editor
{
    public class BoxBlastSetupTool : EditorWindow
    {
        [MenuItem("Tools/Box Blast 2D/Setup Complete Game Scene")]
        public static void SetupCompleteScene()
        {
            // 1. Generate Sprites
            GenerateDefaultSprites();

            // 2. Create Scene
            var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);

            // 3. Configure Main Camera
            Camera cam = Camera.main;
            if (cam != null)
            {
                cam.orthographic = true;
                cam.orthographicSize = 6.2f;
                cam.backgroundColor = new Color(0.055f, 0.067f, 0.09f); // #0e1117
                cam.clearFlags = CameraClearFlags.SolidColor;
                if (cam.GetComponent<CameraShake>() == null)
                {
                    cam.gameObject.AddComponent<CameraShake>();
                }
            }

            // Load generated sprites
            Sprite cellBg = AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Sprites/cell_bg.png");
            Sprite block = AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Sprites/block.png");
            Sprite ice = AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Sprites/ice.png");
            Sprite relic = AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Sprites/relic.png");
            Sprite boardFrame = AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Sprites/board_frame.png");
            Sprite dockTray = AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Sprites/dock_tray.png");

            // 4. Create BoardView
            GameObject boardObj = new GameObject("BoardView");
            var boardView = boardObj.AddComponent<BoardView>();
            SetPrivateField(boardView, "boardFrameSprite", boardFrame);
            SetPrivateField(boardView, "cellBgSprite", cellBg);
            SetPrivateField(boardView, "blockSprite", block);
            SetPrivateField(boardView, "iceSprite", ice);
            SetPrivateField(boardView, "relicSprite", relic);

            // 5. Create HandTray
            GameObject handTrayObj = new GameObject("HandTray");
            var handTray = handTrayObj.AddComponent<HandTrayController>();
            SetPrivateField(handTray, "blockSprite", block);
            SetPrivateField(handTray, "dockTraySprite", dockTray);

            // 6. Create BoosterManager
            GameObject boosterObj = new GameObject("BoosterManager");
            boosterObj.AddComponent<BoosterManager>();

            // 7. Create SoundManager
            GameObject soundObj = new GameObject("SoundManager");
            soundObj.AddComponent<SoundManager>();

            // 8. Create ParticleManager
            GameObject particleObj = new GameObject("BlockParticleManager");
            particleObj.AddComponent<BlockParticleManager>();

            // 9. Create UI Canvas
            GameObject canvasObj = new GameObject("UICanvas");
            Canvas canvas = canvasObj.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            CanvasScaler scaler = canvasObj.AddComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1080, 1920);
            scaler.matchWidthOrHeight = 0.5f;
            canvasObj.AddComponent<GraphicRaycaster>();

            // Create UIManager
            var uiManager = canvasObj.AddComponent<UIManager>();
            SetupCanvasUI(canvasObj, uiManager);

            // 10. Create GameManager
            GameObject gmObj = new GameObject("GameManager");
            gmObj.AddComponent<GameManager>();

            // Save Scene
            string scenePath = "Assets/Scenes/MainGame.unity";
            EditorSceneManager.SaveScene(scene, scenePath);
            AssetDatabase.Refresh();

            EditorUtility.DisplayDialog("Box Blast 2D", "Complete Scene and Sprites successfully configured!\nSaved to Assets/Scenes/MainGame.unity", "Awesome!");
        }

        private static void GenerateDefaultSprites()
        {
            string dir = "Assets/Sprites";
            if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);

            // 1. cell_bg.png (128x128)
            CreateTexture(Path.Combine(dir, "cell_bg.png"), 128, 128, (x, y) =>
            {
                float border = 8f;
                if (x < border || x >= 128 - border || y < border || y >= 128 - border)
                {
                    return new Color(0.15f, 0.18f, 0.28f, 1f); // #262e47 border
                }
                return new Color(0.08f, 0.10f, 0.16f, 0.9f); // #151a29 fill
            });

            // 2. block.png (128x128)
            CreateTexture(Path.Combine(dir, "block.png"), 128, 128, (x, y) =>
            {
                float border = 6f;
                if (x < border || y >= 128 - border)
                {
                    return new Color(1f, 1f, 1f, 0.35f); // Top/Left gloss highlight
                }
                if (x >= 128 - border || y < border)
                {
                    return new Color(0f, 0f, 0f, 0.35f); // Bottom/Right bevel shadow
                }
                return Color.white;
            });

            // 3. ice.png (64x64)
            CreateTexture(Path.Combine(dir, "ice.png"), 64, 64, (x, y) =>
            {
                float cx = 32f, cy = 32f;
                float d = Mathf.Abs(x - cx) + Mathf.Abs(y - cy);
                if (d < 22f) return new Color(0.7f, 0.95f, 1f, 0.9f);
                return Color.clear;
            });

            // 4. relic.png (64x64)
            CreateTexture(Path.Combine(dir, "relic.png"), 64, 64, (x, y) =>
            {
                float cx = 32f, cy = 32f;
                float dist = Vector2.Distance(new Vector2(x, y), new Vector2(cx, cy));
                if (dist < 20f) return new Color(1f, 0.85f, 0.1f, 1f);
                return Color.clear;
            });

            AssetDatabase.Refresh();

            // Set sprite import settings
            SetSpriteImporter("Assets/Sprites/cell_bg.png");
            SetSpriteImporter("Assets/Sprites/block.png");
            SetSpriteImporter("Assets/Sprites/ice.png");
            SetSpriteImporter("Assets/Sprites/relic.png");
        }

        private static void CreateTexture(string path, int width, int height, System.Func<int, int, Color> colorFunc)
        {
            Texture2D tex = new Texture2D(width, height, TextureFormat.RGBA32, false);
            for (int y = 0; y < height; y++)
            {
                for (int x = 0; x < width; x++)
                {
                    tex.SetPixel(x, y, colorFunc(x, y));
                }
            }
            tex.Apply();
            File.WriteAllBytes(path, tex.EncodeToPNG());
        }

        private static void SetSpriteImporter(string path)
        {
            TextureImporter importer = AssetImporter.GetAtPath(path) as TextureImporter;
            if (importer != null)
            {
                importer.textureType = TextureImporterType.Sprite;
                importer.spritePixelsPerUnit = 100;
                importer.filterMode = FilterMode.Bilinear;
                importer.SaveAndReimport();
            }
        }

        private static void SetupCanvasUI(GameObject canvasObj, UIManager uiManager)
        {
            Font font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");

            // Top HUD Container
            GameObject topHud = new GameObject("TopHUD");
            topHud.transform.SetParent(canvasObj.transform, false);
            RectTransform rtTop = topHud.AddComponent<RectTransform>();
            rtTop.anchorMin = new Vector2(0, 1);
            rtTop.anchorMax = new Vector2(1, 1);
            rtTop.pivot = new Vector2(0.5f, 1);
            rtTop.sizeDelta = new Vector2(0, 260);

            // 1. Hero Score Text
            GameObject scoreObj = new GameObject("ScoreText");
            scoreObj.transform.SetParent(topHud.transform, false);
            Text scoreTxt = scoreObj.AddComponent<Text>();
            scoreTxt.font = font;
            scoreTxt.fontStyle = FontStyle.Bold;
            scoreTxt.fontSize = 84;
            scoreTxt.alignment = TextAnchor.MiddleCenter;
            scoreTxt.color = Color.white;
            scoreTxt.text = "0";
            RectTransform rtScore = scoreObj.GetComponent<RectTransform>();
            rtScore.anchoredPosition = new Vector2(0, -65);
            rtScore.sizeDelta = new Vector2(500, 100);

            // 2. Best Record Pill Card
            GameObject pillObj = new GameObject("BestRecordPill");
            pillObj.transform.SetParent(topHud.transform, false);
            RectTransform rtPill = pillObj.AddComponent<RectTransform>();
            rtPill.anchoredPosition = new Vector2(0, -132);
            rtPill.sizeDelta = new Vector2(240, 46);
            Image pillImg = pillObj.AddComponent<Image>();
            pillImg.color = new Color(0.12f, 0.14f, 0.19f, 0.95f); // #1f2330 card

            GameObject bestTxtObj = new GameObject("BestScoreText");
            bestTxtObj.transform.SetParent(pillObj.transform, false);
            Text bestTxt = bestTxtObj.AddComponent<Text>();
            bestTxt.font = font;
            bestTxt.fontSize = 26;
            bestTxt.fontStyle = FontStyle.Bold;
            bestTxt.alignment = TextAnchor.MiddleCenter;
            bestTxt.color = new Color(0.015f, 0.67f, 0.43f); // #04AA6D emerald
            bestTxt.text = "👑 BEST 0";
            RectTransform rtBest = bestTxtObj.GetComponent<RectTransform>();
            rtBest.anchorMin = Vector2.zero;
            rtBest.anchorMax = Vector2.one;
            rtBest.sizeDelta = Vector2.zero;

            // 3. Combo Badge
            GameObject comboObj = new GameObject("ComboBadge");
            comboObj.transform.SetParent(topHud.transform, false);
            RectTransform rtCombo = comboObj.AddComponent<RectTransform>();
            rtCombo.anchoredPosition = new Vector2(0, -195);
            rtCombo.sizeDelta = new Vector2(220, 44);
            Image comboImg = comboObj.AddComponent<Image>();
            comboImg.color = new Color(0.015f, 0.67f, 0.43f, 1f); // #04AA6D

            GameObject comboTxtObj = new GameObject("ComboText");
            comboTxtObj.transform.SetParent(comboObj.transform, false);
            Text comboTxt = comboTxtObj.AddComponent<Text>();
            comboTxt.font = font;
            comboTxt.fontStyle = FontStyle.Bold;
            comboTxt.fontSize = 24;
            comboTxt.alignment = TextAnchor.MiddleCenter;
            comboTxt.color = Color.white;
            comboTxt.text = "COMBO 2x!";
            RectTransform rtComboTxt = comboTxtObj.GetComponent<RectTransform>();
            rtComboTxt.anchorMin = Vector2.zero;
            rtComboTxt.anchorMax = Vector2.one;
            rtComboTxt.sizeDelta = Vector2.zero;
            comboObj.SetActive(false);

            SetPrivateField(uiManager, "scoreText", scoreTxt);
            SetPrivateField(uiManager, "bestScoreText", bestTxt);
            SetPrivateField(uiManager, "comboBadge", comboObj);
            SetPrivateField(uiManager, "comboText", comboTxt);
            SetPrivateField(uiManager, "classicHud", topHud);
        }

        private static void SetPrivateField(object target, string fieldName, object value)
        {
            var field = target.GetType().GetField(fieldName, System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            if (field != null) field.SetValue(target, value);
        }
    }
}
