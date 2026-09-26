using UnityEngine;

namespace BoxBlast2D
{
    public static class ColorPalette
    {
        public static readonly Color ColorCyan = new Color(0.0f, 0.90f, 1.0f);       // #00E5FF
        public static readonly Color ColorAmber = new Color(1.0f, 0.70f, 0.0f);      // #FFB300
        public static readonly Color ColorRuby = new Color(1.0f, 0.09f, 0.27f);      // #FF1744
        public static readonly Color ColorEmerald = new Color(0.0f, 0.90f, 0.46f);   // #00E676
        public static readonly Color ColorPurple = new Color(0.83f, 0.0f, 0.98f);    // #D500F9
        public static readonly Color ColorSapphire = new Color(0.16f, 0.47f, 1.0f);  // #2979FF
        public static readonly Color ColorPink = new Color(0.96f, 0.0f, 0.34f);      // #F50057

        public static readonly Color CellBackground = new Color(0.08f, 0.10f, 0.16f, 0.85f); // #151a29
        public static readonly Color CellBorder = new Color(0.15f, 0.18f, 0.28f, 1.0f);     // #262e47
        public static readonly Color GhostHighlight = new Color(1.0f, 1.0f, 1.0f, 0.35f);
        public static readonly Color LinePulseHighlight = new Color(1.0f, 0.9f, 0.2f, 0.5f);

        public static Color GetColor(ColorTheme theme)
        {
            switch (theme)
            {
                case ColorTheme.Cyan: return ColorCyan;
                case ColorTheme.Amber: return ColorAmber;
                case ColorTheme.Ruby: return ColorRuby;
                case ColorTheme.Emerald: return ColorEmerald;
                case ColorTheme.Purple: return ColorPurple;
                case ColorTheme.Sapphire: return ColorSapphire;
                case ColorTheme.Pink: return ColorPink;
                default: return ColorCyan;
            }
        }
    }
}
