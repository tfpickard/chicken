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
 /________/_   _\\________\\`,

	// Frame 10: Chicken with sunglasses (cool chicken)
	`
       __//
      /B__B\\
      \\_._/
       | |
      _| |_
     /_   _\\`,

	// Frame 11: Upside down chicken
	`
     \\_ _ _/
      _| |_
       | |
      /._.\\_
      \\<__/.
      \\\\__`,

	// Frame 12: Tiny chicken
	`
      __/
     /.>
     \\_/
      |
     _|_`,

	// Frame 13: Wide chicken
	`
     __//___
    /.__>_  \\
    \\_._____/
     | | | |
    _|_|_|_|_
   /__     __\\`,

	// Frame 14: Chicken army (multiple chickens)
	`
   __//  __//  __//
  /._>\\ /._>\\ /._>\\
  \\_._/ \\_._/ \\_._/
   | |   | |   | |
  _| |_ _| |_ _| |_`,

	// Frame 15: Laser chicken
	`
       __//
      /O__O\\===>
      \\_._/
       | |
      _| |_
     /_   _\\`,

	// Frame 16: Party chicken
	`
   ♪  __//  ♫
     /^__^\\
     \\_~_/
      \\ /
      _| |_
     /_   _\\`,

	// Frame 17: Sleeping chicken
	`
       __//
      /z__z\\
      \\_._/
       | |
      _| |_
     /_   _\\`,

	// Frame 18: Running chicken
	`
       __//
      /.__>\\>>>
      \\_._/
       |/
      _|
     /_`,

	// Frame 19: Thicc chicken
	`
       __//
      /O__O\\
     ((\_._/))
       | |
      _| |_
     /_   _\\`,

	// Frame 20: Baby chicken (chick)
	`
      __/
     /.>
     (.)
      |
     _|_`,

	// Frame 21: Ninja chicken
	`
     * __//*
      /o__o\\
      \\_X_/
       |/|
      _|_|_
     /_   _\\`,

	// Frame 22: Chef chicken
	`
     [===]
      __//
     /.__>\\
     \\_._/
      | |
     _| |_`,

	// Frame 23: Boxing chicken
	`
    O  __// O
      /.__>\\
      \\_v_/
       | |
      _| |_
     /_   _\\`,

	// Frame 24: Dizzy chicken
	`
      @  @
       __//
      /x__x\\
      \\_~_/
       | |
      _| |_`,

	// Frame 25: Royal chicken (with crown)
	`
      \\/\\/
       __//
      /.__>\\
      \\_._/
       | |
      _| |_
     /_   _\\`,

	// Frame 26: Superhero chicken
	`
       __//
      /O__O\\
     [[\\_._/]]
       | |
      _| |_
     /_   _\\`,

	// Frame 27: Wizard chicken
	`
    *  __//*
   *  /.^>\\  *
      \\_._/
       |*|
      _| |_
     /_   _\\`,

	// Frame 28: Chicken laying egg
	`
       __//
      /.__>\\
      \\_._/
       | |
      _| |_  O
     /_   _\\`,

	// Frame 29: Backwards chicken
	`
      \\\\__
      /<._.\\
       /._/
       | |
      _| |_
     /_   _\\`,

	// Frame 30: Startled chicken
	`
    !  __//  !
      /O__O\\
      \\_^_/
      /| |\\
     / | | \\
    /__| |__\\`,

	// Frame 31: Detective chicken
	`
       __//
      /o__O\\
      \\_._/~
       | |
      _| |_
     /_   _\\`,

	// Frame 32: Pirate chicken
	`
       __//
      /X__o\\~
      \\_._/
       | |
      _| |_
     /_   _\\`,

	// Frame 33: Chicken with bow tie
	`
       __//
      /^__^\\
      \\_<>_/
       | |
      _| |_
     /_   _\\`,

	// Frame 34: Astronaut chicken
	`
     (_____)
      |_//|
      /.__>\\
      \\_._/
       | |
      _| |_`,

	// Frame 35: Chicken on one leg
	`
       __//
      /.__>\\
      \\_._/
       |
       |
      _|_`,

	// Frame 36: Rainbow chicken
	`
   ~*~__//~*~
     /^__^\\
     \\_._/
      | |
     _| |_
    /_   _\\`,

	// Frame 37: Grumpy chicken
	`
       __//
      />__<\\
      \\_v_/
       | |
      _| |_
     /_   _\\`
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
