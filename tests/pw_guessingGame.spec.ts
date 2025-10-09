import { test, expect } from '@playwright/test'
import guessingGame from './pom/pw_guessingGame.page'

test.describe('Testing the guessing game behavior', () => {

  let pageLocator: guessingGame

  test.beforeEach('Accessing the website', async ({ page }) => {
    await page.goto('https://mapleqa.com/js22/?randomParam=12')
    //page.waitForTimeout(5000)
    pageLocator = new guessingGame(page)
  })


  test('[TS888-001]: Verify Initial Application State on Load', async ({ page }) => {
    await expect(pageLocator.getContainer1).toBeVisible()
    await expect(pageLocator.getFrontCardTitle).toContainText('Guess the card value')
    await expect(pageLocator.getFrontCardValue).toContainText('**')
    await expect(pageLocator.getMainContainer).toBeVisible()
    await expect(pageLocator.getGuessField).toBeFocused()
    await expect(pageLocator.getGuessField).toBeEmpty()
    await expect(pageLocator.getGuessField).toBeEnabled()
    await expect(pageLocator.getGuessButton).toBeDisabled()
    await expect(pageLocator.getGuessButton).toHaveText('GUESS')
    await expect(pageLocator.getTooltip).toHaveText('Enter the number here')

    await expect(pageLocator.getMessage).toBeEmpty()

    await expect(pageLocator.getGuessContainer).toBeVisible()
    await expect(pageLocator.getGuessTitle).toHaveText('guesses')
    await expect(pageLocator.getGuessList).toBeEmpty()

    await expect(pageLocator.getAttemptContainer).toBeVisible()
    await expect(pageLocator.getAttemptTitle).toHaveText('ATTEMPTS')
    await expect(pageLocator.getShowAttempt).toBeHidden()
  })


  test('[TS888-002]: Verify "GUESS" Button Enables/Disables with Input', async ({ page }) => {
    await expect(pageLocator.getGuessButton).toBeDisabled()
    await pageLocator.getGuessField.fill('1')
    await expect(pageLocator.getGuessButton).toBeEnabled()

    await pageLocator.getGuessField.clear()
    await expect(pageLocator.getGuessField).toBeEmpty()
    await expect(pageLocator.getGuessButton).toBeDisabled()
  })


  test('[TS888-003]: Verify Correct Guess on First Attempt (Win Condition)', async ({ page }) => {
    const correctNum = '12'
    await pageLocator.gameStart(correctNum)

    await expect.soft(pageLocator.getContainer1).toContainClass('flipped')
    await expect(pageLocator.getCorrectNum).toHaveText(correctNum)

    await expect(pageLocator.getMessage).toHaveText('Congratulations! You guessed the number!')
    await expect(pageLocator.getResetButton).toHaveText('RESET')
    await expect(pageLocator.getResetButton).toBeEnabled()
    await expect(pageLocator.getGuessField).toBeDisabled()

    await expect(pageLocator.getGuessList.locator('> span')).toHaveCount(1)
    await expect(pageLocator.getGuessValue).toHaveText(correctNum)
    await expect(pageLocator.getGuessValue).toContainClass('guessed')
    await expect(pageLocator.getShowAttempt).toHaveText('1 / 10')
  })


  test('[TS888-004]: Verify "My number is larger" Feedback (Too Low)', async ({ page }) => {
    await pageLocator.gameStart('5')

    await expect(pageLocator.getMessage).toHaveText('My number is larger.\n Try Again!')
    await expect(pageLocator.getGuessField).toBeEmpty()
    await expect(pageLocator.getGuessField).toBeFocused()

    await expect(pageLocator.getGuessValue).toHaveCount(1)
    await expect(pageLocator.getGuessValue).toHaveText('5')
    await expect(pageLocator.getShowAttempt).toHaveText('1 / 10')
  })


  test('[TS888-005]: Verify "My number is smaller" Feedback (Too High)', async ({ page }) => {
    await pageLocator.gameStart('20')

    await expect(pageLocator.getMessage).toContainText('My number is smaller.\n Try Again!')
    await expect(pageLocator.getGuessField).toBeEmpty()
    await expect(pageLocator.getGuessField).toBeFocused()

    await expect(pageLocator.getGuessValue).toHaveCount(1)
    await expect(pageLocator.getGuessValue).toHaveText('20')
    await expect(pageLocator.getShowAttempt).toHaveText('1 / 10')
  })


  test('[TS888-006]: Validate Input Boundary (Lower): Number 1', async ({ page }) => {
    await pageLocator.gameStart('1')

    await expect(pageLocator.getMessage).not.toContainText('ERROR')
    await expect(pageLocator.getGuessValue).toHaveCount(1)
    await expect(pageLocator.getShowAttempt).toHaveText('1 / 10')
  })


  test('[TS888-007]: Validate Input Boundary (Upper): Number 50', async ({ page }) => {
    await pageLocator.gameStart('50')

    await expect(pageLocator.getMessage).not.toContainText('ERROR')
    await expect(pageLocator.getGuessValue).toHaveCount(1)
    await expect(pageLocator.getGuessValue).toHaveText('50')
  })


  test('[TS888-008]: Verify Error for Out-of-Range Input (Low: 0)', async ({ page }) => {
    await pageLocator.gameStart('0')

    await expect(pageLocator.getMessage).toHaveText('ERROR:Input should be between 1 & 50')
    await expect(pageLocator.getGuessValue).toHaveCount(0)
    await expect(pageLocator.getShowAttempt).toHaveText('0 / 10')
  })


  test('[TS888-009]: Verify Error for Out-of-Range Input (High: 51)', async ({ page }) => {
    await pageLocator.gameStart('51')

    await expect(pageLocator.getMessage).toHaveText('ERROR:Input should be between 1 & 50')
    await expect(pageLocator.getGuessValue).toHaveCount(0)
    await expect(pageLocator.getShowAttempt).toHaveText('0 / 10')
  })


  test('[TS888-010]: Verify Error for Negative Input', async ({ page }) => {
    await pageLocator.gameStart('-5')

    await expect(pageLocator.getMessage).toHaveText('ERROR:Input should be between 1 & 50')
    await expect(pageLocator.getGuessValue).toHaveCount(0)
    await expect(pageLocator.getShowAttempt).toHaveText('0 / 10')
  })


  test('[TS888-011]: Verify Error for Non-Numeric Input', async ({ page }) => {
    await pageLocator.gameStart('ab')

    await expect(pageLocator.getMessage).toHaveText('ERROR:Input should be between 1 & 50')
    await expect(pageLocator.getGuessValue).toHaveCount(0)
    await expect(pageLocator.getShowAttempt).toHaveText('0 / 10')
  })


  test('[TS888-012]: Verify Game Over After 10 Incorrect Attempts (Lose Condition)', async ({ page }) => {
    const inputGuesses = [1, 2, 3, 50, 40, 39, 15, 14, 9, 11]

    for (let i = 0; i < inputGuesses.length; i++) {
      const guess = inputGuesses[i];
      let attemptsCount = i + 1

      await pageLocator.gameStart(guess.toString())

      await expect(pageLocator.getShowAttempt).toHaveText(attemptsCount + ' / 10')
      await expect(pageLocator.getGuessValue).toHaveCount(attemptsCount)
    }

    await expect.soft(pageLocator.getContainer1).toContainClass('flipped')
    await expect(pageLocator.getCorrectNum).toHaveText('12')

    await expect(pageLocator.getMessage).toHaveText("Game Over! You've used all your attempts.")
    await expect(pageLocator.getResetButton).toHaveText('RESET')
    await expect(pageLocator.getResetButton).toBeEnabled()
    await expect(pageLocator.getGuessField).toBeDisabled()
  })


  test('[TS888-013]: Verify "RESET" Button Functionality After Win', async ({ page }) => {
    let correctNum = '12'
    await pageLocator.gameStart(correctNum)

    await expect(pageLocator.getResetButton).toHaveText('RESET')
    await expect(pageLocator.getGuessField).toBeDisabled()
    await expect(pageLocator.getResetButton).toBeEnabled()
    await page.reload()

    //Initial State
    await expect(pageLocator.getContainer1).toBeVisible()
    await expect(pageLocator.getFrontCardTitle).toContainText('Guess the card value')
    await expect(pageLocator.getFrontCardValue).toContainText('**')
    await expect(pageLocator.getMainContainer).toBeVisible()
    await expect(pageLocator.getGuessField).toBeFocused()
    await expect(pageLocator.getGuessField).toBeEmpty()
    await expect(pageLocator.getGuessField).toBeEnabled()
    await expect(pageLocator.getGuessButton).toBeDisabled()
    await expect(pageLocator.getGuessButton).toHaveText('GUESS')
    await expect(pageLocator.getTooltip).toHaveText('Enter the number here')
    await expect(pageLocator.getMessage).toBeEmpty()
    await expect(pageLocator.getGuessContainer).toBeVisible()
    await expect(pageLocator.getGuessTitle).toHaveText('guesses')
    await expect(pageLocator.getGuessList).toBeEmpty()
    await expect(pageLocator.getAttemptContainer).toBeVisible()
    await expect(pageLocator.getAttemptTitle).toHaveText('ATTEMPTS')
    await expect(pageLocator.getShowAttempt).toBeHidden()
  })


  test('[TS888-014]: Verify "RESET" Button Functionality After Loss (via enter key)', async ({ page }) => {
    const inputGuesses = [50, 39, 11, 4, 29, 20, 15, 1, 8, 10]

    for (let i = 0; i < inputGuesses.length; i++) {
      const guess = inputGuesses[i];
      let attemptsCount = i + 1

      await pageLocator.gameStart(guess.toString())

      await expect(pageLocator.getShowAttempt).toHaveText(attemptsCount + ' / 10')
      await expect(pageLocator.getGuessValue).toHaveCount(attemptsCount)
    }

    await expect.soft(pageLocator.getContainer1).toContainClass('flipped')
    await expect(pageLocator.getCorrectNum).toHaveText('12')

    await expect(pageLocator.getMessage).toHaveText("Game Over! You've used all your attempts.")
    await expect(pageLocator.getResetButton).toHaveText('RESET')
    await expect(pageLocator.getResetButton).toBeEnabled()
    await expect(pageLocator.getGuessField).toBeDisabled()

    await pageLocator.getResetButton.press('Enter')
    await page.reload()

    //Initial State
    await expect(pageLocator.getContainer1).toBeVisible()
    await expect(pageLocator.getFrontCardTitle).toContainText('Guess the card value')
    await expect(pageLocator.getFrontCardValue).toContainText('**')
    await expect(pageLocator.getMainContainer).toBeVisible()
    await expect(pageLocator.getGuessField).toBeFocused()
    await expect(pageLocator.getGuessField).toBeEmpty()
    await expect(pageLocator.getGuessField).toBeEnabled()
    await expect(pageLocator.getGuessButton).toBeDisabled()
    await expect(pageLocator.getGuessButton).toHaveText('GUESS')
    await expect(pageLocator.getTooltip).toHaveText('Enter the number here')
    await expect(pageLocator.getMessage).toBeEmpty()
    await expect(pageLocator.getGuessContainer).toBeVisible()
    await expect(pageLocator.getGuessTitle).toHaveText('guesses')
    await expect(pageLocator.getGuessList).toBeEmpty()
    await expect(pageLocator.getAttemptContainer).toBeVisible()
    await expect(pageLocator.getAttemptTitle).toHaveText('ATTEMPTS')
    await expect(pageLocator.getShowAttempt).toBeHidden()
  })


  test('[TS888-015]: Verify Attempts Counter Increments Only on Valid Guesses', async ({ page }) => {
    const inputNum = [0, 60, 5, 30, 12]
    let validCount = 0

    for (let i = 0; i < inputNum.length; i++) {
      const currentValue = inputNum[i];

      await pageLocator.gameStart(currentValue.toString())

      if (currentValue < 1 || currentValue > 50) {
        await expect(pageLocator.getShowAttempt).toHaveText(0 + ' / 10')
        await expect(pageLocator.getGuessValue).toHaveCount(0)
      } else {
        validCount++

        await expect(pageLocator.getShowAttempt).toHaveText(validCount + ' / 10')
        await expect(pageLocator.getGuessValue).toHaveCount(validCount)
      }
    }
  })


  test('[TS888-016]: Verify Sequential Guesses with Mixed Feedback', async ({ page }) => {
    const guesses = [
      { num: '5', expectedResult: 'My number is larger.\n Try Again!' },
      { num: '20', expectedResult: 'My number is smaller.\n Try Again!' },
      { num: '12', expectedResult: 'Congratulations! You guessed the number!' },
    ]

    for (let i = 0; i < guesses.length; i++) {
      const value = guesses[i]
      await pageLocator.gameStart(value.num)

      await expect(pageLocator.getGuessField).toBeEmpty()
      await expect(pageLocator.getMessage).toHaveText(value.expectedResult)

      await expect(pageLocator.getGuessValue.nth(i)).toHaveText(value.num)
    }
  })


  test('TS888-017]: Verify Input via Keyboard "Enter" Key', async ({ page }) => {
    await pageLocator.gameStart('1')

    await expect(pageLocator.getMessage).toHaveText('My number is larger.\n Try Again!')
    await expect(pageLocator.getGuessField).toBeEmpty()
    await expect(pageLocator.getGuessField).toBeFocused()
    await expect(pageLocator.getShowAttempt).toHaveText('1  / 10')
    await expect(pageLocator.getGuessValue).toHaveCount(1)
  })


  test('[TS888-018]: Verify Previous Guesses Styling and Order', async ({ page }) => {
    const inputGuesses = [25, 10, 12]

    for (let i = 0; i < inputGuesses.length; i++) {
      const guess = inputGuesses[i];
      await pageLocator.gameStart(guess.toString())

      let attemptsCount = (i + 1)

      await expect(pageLocator.getGuessValue).toHaveCount(attemptsCount)
      await expect(pageLocator.getShowAttempt).toHaveText(attemptsCount + ' / 10')

      if (guess == 12) {
        await expect(pageLocator.getGuessValue.nth(i)).toHaveText(inputGuesses[i].toString())
        await expect(pageLocator.getGuessValue.nth(i)).toContainClass('boxed')
        await expect(pageLocator.getGuessValue.nth(i)).toContainClass('guessed')
      } else {
        await expect(pageLocator.getGuessValue.nth(i)).toHaveText(inputGuesses[i].toString())
        await expect(pageLocator.getGuessValue.nth(i)).toContainClass('boxed')
        await expect(pageLocator.getGuessValue.nth(i)).not.toContainClass('guessed')
      }
    }
  })


  test('[TS888-019]: Verify Mixed Out-of-Range and Valid Attempts Count', async ({ page }) => {
    const inputNum = [0, 60, 5, 30, 12]
    let validCount = 0

    for (let i = 0; i < inputNum.length; i++) {
      const currentValue = inputNum[i];

      await pageLocator.gameStart(currentValue.toString())

      if (currentValue < 1 || currentValue > 50) {
        await expect(pageLocator.getMessage).toHaveText('ERROR:Input should be between 1 & 50')
      } else {
        validCount++

        await expect(pageLocator.getGuessValue).toHaveCount(validCount)
        await expect(pageLocator.getShowAttempt).toHaveText(validCount + ' / 10')
      }
    }
  })

  test('[TS888-020]: Verify guess field is focused if mouse is use', async ({ page }) => {
    await pageLocator.getGuessField.click()
    await expect(pageLocator.getGuessField).toBeFocused()
  })

})