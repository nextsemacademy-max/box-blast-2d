import 'package:flutter_test/flutter_test.dart';
import 'package:box_blast_2d/main.dart';

void main() {
  testWidgets('App loads smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const BoxBlastApp());
    expect(find.byType(BoxBlastApp), findsOneWidget);
  });
}
