/**
 * ASCII Chicken Art Repository
 * Enterprise-grade poultry visualization assets
 */

export const CHICKEN_FRAMES: string[] = [
	// Frame 0: Standard chicken, looking right
	`
       __//
      /.__>\\
      \\_._/
       | |
      _| |_
     /_   _\\`,

	// Frame 1: Chicken pecking down
	`
       __//
      /.  >
      \\_./
       |V|
      _| |_
     /_   _\\`,

	// Frame 2: Chicken wings out
	`
       __//
     >/.__>\\<
      \\_._/
       | |
      _| |_
     /_   _\\`,

	// Frame 3: Chicken looking left
	`
      \\\\__
      /<__./
       \\_._/
        | |
       _| |_
      /_   _\\`,

	// Frame 4: Excited chicken
	`
    * __//* *
   * /.__>\\ *
      \\_._/
       | |
      _| |_
     /_   _\\`,

	// Frame 5: Dancing chicken left
	`
       __//
      /.__>\\
      \\_._/
       | |
      _| |
     /_   \\`,

	// Frame 6: Dancing chicken right
	`
       __//
      /.__>\\
      \\_._/
       | |
       | |_
      /   _\\`,

	// Frame 7: Flapping chicken
	`
    \\  __// /
     >/.__>/<
      \\_._/
       | |
      _| |_
     /_   _\\`,

	// Frame 8: Jumping chicken
	`
       __//
      /.__>\\
      \\_._/
       | |

     /_   _\\`,

	// Frame 9: Mega chicken (for Konami)
	`
           ___//
          /.__>\\
          \\_.^_/
     __    /| |\\    __
    /  \\__/ | | \\__/  \\
   /        | |        \\
  /        _| |_        \\
 /________/_   _\\________\\`
];

// The screaming chicken for Konami code activation
export const SCREAMING_CHICKEN = `
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║                         ___//                                    ║
║                        /O__O\\   BAWWWWWWWWK!!!                   ║
║                        \\_^^_/                                    ║
║                   __    /| |\\    __                              ║
║                  /  \\__/ | | \\__/  \\                             ║
║                 /        | |        \\                            ║
║                /        _| |_        \\                           ║
║               /________/_   _\\________\\                          ║
║                                                                  ║
║              C H I C K E N   A C T I V A T E D                   ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝`;

// Generate the holy word
export function generateChickens(count: number): string {
	const safeCount = Math.min(Math.max(1, count), 50000);
	return Array(safeCount).fill('chicken').join(' ');
}

// Generate chickens as array (for JSON endpoint)
export function generateChickenArray(count: number): string[] {
	const safeCount = Math.min(Math.max(1, count), 50000);
	return Array(safeCount).fill('chicken');
}
