"""
Chicken ASCII art and generation utilities
"""

# ASCII art frames for the rave animation
ASCII_FRAMES = [
    r'''
       \\
       (o>
    \\_//)
     \_/_)
      _|_
    ''',
    r'''
         \\
         (o>
      \\_//)
       \_/_)
        _|_
    ''',
    r'''
           \\
           (o>
        \\_//)
         \_/_)
          _|_
    ''',
    r'''
         \\
         (o>
      \\_//)
       \_/_)
        _|_
    ''',
    r'''
       \\
       (o>
    \\_//)
     \_/_)
      _|_
    ''',
    r'''
     \\
     (o>
  \\_//)
   \_/_)
    _|_
    ''',
    r'''
   \\
   (o>
\\_//)
 \_/_)
  _|_
    ''',
    r'''
     \\
     (o>
  \\_//)
   \_/_)
    _|_
    ''',
    r'''
       \\
       (o>
    \\_//)
     \_/_)
      _|_
    ''',
    r'''
         \\
         (o>
      \\_//)
       \_/_)
        _|_
    ''',
]

SCREAMING_CHICKEN = r'''
    \\
    (O>  BAWK!
 \\_//)
  \_/_)
   _|_
'''

MAX_CHICKENS = 50000


def generate_chickens(count: int) -> str:
    """Generate a string of chickens separated by spaces"""
    safe_count = min(max(0, count), MAX_CHICKENS)
    return " ".join(["chicken"] * safe_count)


def generate_chicken_list(count: int) -> list[str]:
    """Generate a list of chicken strings"""
    safe_count = min(max(0, count), MAX_CHICKENS)
    return ["chicken"] * safe_count
