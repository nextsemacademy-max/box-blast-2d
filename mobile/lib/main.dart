import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

final InAppLocalhostServer localhostServer = InAppLocalhostServer(
  documentRoot: 'assets/web',
  port: 8080,
);

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // 1. Start Localhost Server for Offline 60fps HTML5 Engine
  try {
    await localhostServer.start();
  } catch (e) {
    debugPrint('Localhost server error: $e');
  }

  // 2. Lock Orientation to Portrait (Standard Android 2D Puzzle Game)
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // 3. Android System Inset Styling (Transparent Status Bar, Dark Nav Pill)
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF080A0F),
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  runApp(const BoxBlastApp());
}

class BoxBlastApp extends StatelessWidget {
  const BoxBlastApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Box Blast 2D',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        scaffoldBackgroundColor: const Color(0xFF080A0F),
        brightness: Brightness.dark,
      ),
      home: const GameShellScreen(),
    );
  }
}

class GameShellScreen extends StatefulWidget {
  const GameShellScreen({super.key});

  @override
  State<GameShellScreen> createState() => _GameShellScreenState();
}

class _GameShellScreenState extends State<GameShellScreen> {
  InAppWebViewController? webViewController;
  bool isGameLoaded = false;

  @override
  void dispose() {
    localhostServer.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF080A0F),
      body: SafeArea(
        top: false,
        bottom: false,
        child: PopScope(
          canPop: false,
          onPopInvokedWithResult: (didPop, result) async {
            if (didPop) return;

            // Handle Android Back Button
            final bool? shouldExit = await showDialog<bool>(
              context: context,
              builder: (ctx) => AlertDialog(
                backgroundColor: const Color(0xFF131722),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                  side: const BorderSide(color: Color(0xFF253043), width: 2),
                ),
                title: const Text(
                  'Exit Game?',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                content: const Text(
                  'Are you sure you want to exit Box Blast 2D?',
                  style: TextStyle(color: Color(0xFF94A3B8)),
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.of(ctx).pop(false),
                    child: const Text(
                      'STAY',
                      style: TextStyle(
                        color: Color(0xFF38BDF8),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  TextButton(
                    onPressed: () => Navigator.of(ctx).pop(true),
                    child: const Text(
                      'EXIT',
                      style: TextStyle(
                        color: Color(0xFFEF4444),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            );

            if (shouldExit == true) {
              SystemNavigator.pop();
            }
          },
          child: Stack(
            children: [
              InAppWebView(
                initialUrlRequest: URLRequest(
                  url: WebUri('http://localhost:8080/index.html'),
                ),
                initialSettings: InAppWebViewSettings(
                  supportZoom: false,
                  mediaPlaybackRequiresUserGesture: false,
                  allowsInlineMediaPlayback: true,
                  useHybridComposition: true,
                  hardwareAcceleration: true,
                  transparentBackground: false,
                  overScrollMode: OverScrollMode.NEVER,
                  verticalScrollBarEnabled: false,
                  horizontalScrollBarEnabled: false,
                ),
                onWebViewCreated: (controller) {
                  webViewController = controller;
                },
                onLoadStop: (controller, url) {
                  setState(() {
                    isGameLoaded = true;
                  });
                },
              ),
              if (!isGameLoaded)
                Container(
                  color: const Color(0xFF080A0F),
                  alignment: Alignment.center,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: const [
                      SizedBox(
                        width: 44,
                        height: 44,
                        child: CircularProgressIndicator(
                          strokeWidth: 3.5,
                          valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF38BDF8)),
                        ),
                      ),
                      SizedBox(height: 20),
                      Text(
                        'BOX BLAST 2D',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 2,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
