## Project Title
GBDA 302 A2 Midterm Game: NekoBeat
---
## Group Number (only for group work)
7B

---
## Description
NekoBeat is a rhythm-based game where players press keys in time with falling beats. Blocks move toward a hit bar and the player must press the corresponding key when the beat reaches the correct timing zone, the `Hit Bar`.

The game focuses on rhythm recognition, reaction speed and timing accuracy. Visual feedback and sound cues help guide the player and reinforce successful or missed inputs. The design was inspired by rhythm games such as piano-tile style gameplay, where the challenge comes from matching inputs with musical timing.

Players experience a progressively engaging loop where they attempt to maintain rhythm accuracy while reacting quickly to incoming beats.

---
## Interaction Instructions
1. Open the GitHub Pages link for the project.
2. The game will load automatically in your browser.
3. The splash screen titled `NekoBeat` will appear.

## Starting the Game
When the game opens, the player first sees a Home screen with two buttons:

- `Play` – starts the game
- `Instructions` – opens the Instructions screen explaining the controls and gameplay

Players can read the instructions before starting or immediately begin playing.

## Controls
The rhythm gameplay uses two keyboard keys:

- `F` key – hit the left beat
- `J` key – hit the right beat

Players must press the correct key when the falling beat reaches the `Hit Bar` at the bottom of the screen.

## Gameplay
- Beats fall from the top of the screen toward the hit bar.
- The player presses `F` or `J` when the beat reaches the bar.
- Correct timing and key input will register a successful hit.

## Game Interface
- A `PAUSE` button appears in the top right corner during gameplay, allowing players to pause the game at any time.
- Players can also return to the Home screen during gameplay by clicking the`< BACK` button in the top left corner.

## Gameplay Feedback
- All `F` and `J` keyboard inputs trigger audio feedback as a sound effect.
- Successful hits trigger visual feedback, generating a burst animation and text feedback (`Early`/`Perfect`/`Late`) depending on the accuracy of the hit.
- Mistimed inputs will end the game, textual feedback indicating that a beat was missed.
- The objective is to maintain rhythm accuracy and hit as many beats correctly as possible, finishing all levels.

---
## Iteration Notes (Post-Playtest)
Playtesting Summary:

During playtesting, the player generally found the rhythm game concept straightforward and engaging. However, they experienced difficulty understanding the correct timing window for pressing keys. The player asked whether they should press the key before or after the block reaches the line, indicating uncertainty about when inputs should occur.

The hit bar also felt too strict, making it difficult to land precise hits. This caused the player to sometimes spam keys in order to register a successful input.

Another issue observed was that mistakes reset the sequence too quickly. This prevented the player from understanding what they did wrong. The player suggested clearer feedback when mistakes occur to improve learning.

Despite these challenges, the player remained motivated and interested in the game. They responded positively to the visual design and background graphics, noting that the game reminded them of piano-tile style rhythm games.

The player also suggested possible features that could increase engagement, including animations, combo systems, score tracking, power-ups and new mechanics introduced across levels.

### Three Changes Implemented Based on Playtesting

**1. Improve Timing Feedback**

Players had difficulty understanding the correct timing window. To address this:

- Added visual tap feedback when a key is pressed (flash or glow effect), as well as audio feedback (sound effect)
- Added indicators showing whether an input was `Early`/`Perfect`/`Late`

These changes help players learn the timing window more quickly and reduce key spamming.

**2. Adjust the Hit Window and Error Feedback**

The hit bar originally felt too strict and mistakes reset too quickly.

Changes made:

- Slightly increased the hit window tolerance
- Added visual feedback when a mistake occurs before offering players the option to restart

These changes make the gameplay feel fairer and easier to understand.

**3. Add Progression Elements to Increase Engagement**

To make gameplay more rewarding:

- Considering adding a scoring system (more points accrued for more accurate hits)
- Considering introducing combo tracking for consecutive successful hits
- Began planning additional mechanics that can appear in later levels

These changes encourage players to improve performance and maintain rhythm accuracy.

---
## Iteration Notes (Post-Showcase)

Showcase Summary:

During the showcase, players generally enjoyed the rhythm-based gameplay and visual style. However, several issues were identified:

1. **Sound effects:** The synth/laser sound effect when pressing keys became jarring and distracting after repetitive hits during gameplay.
2. **Visual alignment:** The blue cat character appeared slightly off-center, affecting the visual balance.  
3. **Music synchronization:** The beats of the music did not always align with the falling blocks, creating timing confusion.
4. **Challenge simplification:** No need for additional complex mechanics or challenges to be added.

### Changes Implemented / Planned

**1. Update Tap Sound Effect**  
- Replaced the original synth/laser sound with a more subtle and satisfying sound that is easier to listen to repeatedly.  
- Ensures players can audibly confirm successful inputs.

**2. Adjust Character Position**  
- Moved the blue cat character slightly to the left to create a more visually balanced layout.

**3. Sync Music to Beats**  
- Planning to lock music tracks to the `draw()` loop to ensure beats align with frame rate of falling blocks.  
- Future improvements will include exploring JS libraries that provide precise audio-to-frame syncing.
- Instead of rushing to finish this mechanic by the A2 deadline tonight, we will be implementing this for A3 to ensure high quality work is being delivered.

**4. Challenge simplification**
- We will keep the game mechanics simple; instead of introducing many new and different challenges, we will nail the core mechanic of hitting the keys to the rhythm of the music.
- Difficulty progression will be executed through this core musical rhythm mechanic.

---
## Assets
List any images, sounds, or other files used in your assets/ folder.
Include in-text citations for all assets that are not your own, and connect them to your reference list.

> - `assets/image/bkgdGame.png` (original artwork created in Procreate)
> - `assets/image/cyberpunk.png` (original artwork created in Procreate)
> - `assets/image/bunny.png` (original artwork created in Piskel)
> - `assets/image/kitty.png` (original artwork created in Piskel)
> - `assets/audio/chill.mp3` (original composition created in Soundtrap)
> - `assets/audio/beeph.wav` [10]

---
## References
Connect your in-text citations to the reference list along with additional sources that informed your design but were not directly cited. Provide all citations using the ACM reference format. 

[9] Charity, AbleGamers. “Video Games and Disability Representation.” The AbleGamers Charity, 2023. https://ablegamers.org/video-games-disability-representation/.
[10] Epidemic Sound. n.d. "User Interface, Beep, Error Tone, Soft."  
Available at: https://www.epidemicsound.com/sound-effects/tracks/17f72d25-b4a6-4d8f-addc-f446ee8b3cb7/.
[6] Fox, Michael J. “The Michael J. Fox Foundation for Parkinson’s Research.” The Michael J. Fox Foundation for Parkinson’s Research | Parkinson’s Disease, 2019. https://www.michaeljfox.org/.
[7] González, Julia, Leya George, Lidia Miteva, and Aneesha Singh. “Developing Empathy towards Experiences of Invisible Disabilities through Games.” In EmpathiCH ’23: Proceedings of the 2nd Empathy-Centric Design Workshop, 1–8. University College London, 2023. https://doi.org/10.1145/3588967.3588976.
[8] Karen Anne Cochrane and David Han. 2026. Week 4 - Part 1. GBDA302 Course Slides. University of Waterloo, Stratford, Canada.
[2] Mayo Clinic. “Parkinson’s Disease.” Mayo Clinic, September 27, 2024. https://www.mayoclinic.org/diseases-conditions/parkinsons-disease/symptoms-causes/syc-20376055.
[1] National Institute of Neurological Disorders and Stroke. “Parkinson’s Disease: Challenges, Progress, and Promise.” www.ninds.nih.gov, 2023. https://www.ninds.nih.gov/current-research/focus-disorders/parkinsons-disease-research/parkinsons-disease-challenges-progress-and-promise.
[3] Parkinson's Foundation. “Movement Symptoms.” Parkinson’s Foundation, 2017. https://www.parkinson.org/Understanding-Parkinsons/Movement-Symptoms.
[4] ———. “Non-Movement Symptoms.” Parkinson’s Foundation, 2023. https://www.parkinson.org/Understanding-Parkinsons/Non-Movement-Symptoms.
[5] TEDx Talks. “My Parkinson’s Story: Lessons on Optimism and Opportunity | Mark Colo.” Youtube, 2023. https://youtu.be/asf-YXe7hXk?si=2Vrr3nJTfbasGO85.

---