import { test, expect } from '@playwright/test'

test.describe('Testing the guessing game behavior', () => {

  test.beforeEach('Accessing the website', async ({ page }) => {
    await page.goto('https://mapleqa.com/js22/?randomParam=12')
  })


  test('[TS888-001]: Verify Initial Application State on Load', async ({ page }) => {
    await expect(page.locator('#card')).toBeVisible()
    await expect(page.locator('#frontCardTitle')).toContainText('Guess the card value')
    await expect(page.locator('#frontCardValue')).toContainText('**')
    await expect(page.getByTestId('guessField')).toBeFocused()
    await expect(page.getByTestId('guessField')).toBeEmpty()
    await expect(page.getByTestId('guessField')).toBeEnabled()
    await expect(page.getByTestId('guessButton')).toBeDisabled()
    await expect(page.getByTestId('guessButton')).toHaveText('GUESS')
    await expect(page.locator('#instruction')).toHaveText('Enter the number here')

    await expect(page.getByTestId('messageArea')).toBeEmpty()

    await expect(page.getByTestId('prevGuesses')).toBeVisible()
    await expect(page.getByTestId('miscTitle')).toHaveText('guesses')
    await expect(page.getByTestId('guesses')).toBeEmpty()

    await expect(page.getByTestId('attempts')).toBeVisible()
    await expect(page.getByTestId('attemptsTitle')).toHaveText('ATTEMPTS')
    await expect(page.getByTestId('showAttempts')).toBeHidden()
  })


  test('[TS888-002]: Verify "GUESS" Button Enables/Disables with Input', async ({ page }) => {
    await expect(page.getByTestId('guessButton')).toBeDisabled()
    await page.getByTestId('guessField').fill('1')
    await expect(page.getByTestId('guessButton')).toBeEnabled()

    await page.getByTestId('guessField').clear()
    await expect(page.getByTestId('guessField')).toBeEmpty()
    await expect(page.getByTestId('guessButton')).toBeDisabled()
  })


  test('[TS888-003]: Verify Correct Guess on First Attempt (Win Condition)', async ({ page }) => {
    const correctNum = '12'
    await page.getByTestId('guessField').fill(correctNum)
    //await page.click('#guessButton')

    page.locator('#guessButton:visible')
   await page.locator('button:text("GUESS")').click()

    await expect.soft(page.locator('#card')).toContainClass('flipped')
    await expect(page.getByTestId('cardValue')).toHaveText(correctNum)

    await expect(page.getByTestId('messageArea')).toHaveText('Congratulations! You guessed the number!')
    await expect(page.getByTestId('reset')).toHaveText('RESET')
    await expect(page.getByTestId('guessField')).toBeDisabled()
    await expect(page.getByTestId('reset')).toBeEnabled()

    await expect(page.getByTestId('guesses').locator('> span')).toHaveCount(1)
    await expect(page.locator('#guesses > span')).toHaveText(correctNum)
    await expect(page.locator('#guesses > span')).toContainClass('guessed')
    await expect(page.locator('span.rotateAttempt')).toContainText('1')
  })


  test('[TS888-004]: Verify "My number is larger" Feedback (Too Low)', async ({ page }) => {
    await page.getByTestId('guessField').fill('5')
    await page.getByTestId('guessButton').click()

    await expect(page.getByTestId('messageArea')).toHaveText('My number is larger.\n Try Again!')
    await expect(page.getByTestId('guessField')).toBeEmpty()
    await expect(page.getByTestId('guessField')).toBeFocused()

    await expect(page.locator('#guesses > span')).toHaveCount(1)
    await expect(page.locator('#guesses > span')).toHaveText('5')
    await expect(page.locator('.rotateAttempt')).toContainText('1')
  })


  test('[TS888-005]: Verify "My number is smaller" Feedback (Too High)', async ({ page }) => {
    await page.getByTestId('guessField').fill('20')
    await page.getByTestId('guessButton').click()

    await expect(page.getByTestId('messageArea')).toContainText('My number is smaller.\n Try Again!')
    await expect(page.getByTestId('guessField')).toBeEmpty()
    await expect(page.getByTestId('guessField')).toBeFocused()

    await expect(page.locator('#guesses > span')).toHaveCount(1)
    await expect(page.locator('#guesses > span')).toHaveText('20')
    await expect(page.getByTestId('showAttempts')).toHaveText('1 / 10')
  })


  test('[TS888-006]: Validate Input Boundary (Lower): Number 1', async ({ page }) => {
    await page.getByTestId('guessField').fill('1')
    await page.getByTestId('guessButton').click()

    await expect(page.getByTestId('messageArea')).not.toContainText('ERROR')
    await expect(page.getByTestId('guesses').locator('> span')).toHaveCount(1)
    await expect(page.getByTestId('showAttempts')).toHaveText('1 / 10')
  })


  test('[TS888-007]: Validate Input Boundary (Upper): Number 50', async ({ page }) => {
    await page.getByTestId('guessField').fill('50')
    await page.getByTestId('guessButton').click()

    await expect(page.getByTestId('messageArea')).not.toContainText('ERROR')
    await expect(page.locator('#guesses > span')).toHaveCount(1)
    await expect(page.locator('#guesses > span')).toHaveText('50')
  })


  test('[TS888-008]: Verify Error for Out-of-Range Input (Low: 0)', async ({ page }) => {
    await page.getByTestId('guessField').fill('0')
    await page.getByTestId('guessButton').click()

    await expect(page.getByTestId('messageArea')).toHaveText('ERROR:Input should be between 1 & 50')
    await expect(page.locator('#guesses > span')).toHaveCount(0)
    await expect(page.getByTestId('showAttempts')).toHaveText('0 / 10')
  })


  test('[TS888-009]: Verify Error for Out-of-Range Input (High: 51)', async ({ page }) => {
    await page.getByTestId('guessField').fill('51')
    await page.getByTestId('guessButton').click()

    await expect(page.getByTestId('messageArea')).toHaveText('ERROR:Input should be between 1 & 50')
    await expect(page.locator('#guesses > span')).toHaveCount(0)
    await expect(page.getByTestId('showAttempts')).toHaveText('0 / 10')
  })


  test('[TS888-010]: Verify Error for Negative Input', async ({ page }) => {
    await page.getByTestId('guessField').fill('-5')
    await page.getByTestId('guessButton').click()

    await expect(page.getByTestId('messageArea')).toHaveText('ERROR:Input should be between 1 & 50')
    await expect(page.locator('#guesses > span')).toHaveCount(0)
    await expect(page.getByTestId('showAttempts')).toHaveText('0 / 10')

  })


  test('[TS888-011]: Verify Error for Non-Numeric Input', async ({ page }) => {
    await page.getByTestId('guessField').fill('ab')
    await page.getByTestId('guessButton').click()

    await expect(page.getByTestId('messageArea')).toHaveText('ERROR:Input should be between 1 & 50')
    await expect(page.locator('#guesses > span')).toHaveCount(0)
    await expect(page.getByTestId('showAttempts')).toHaveText('0 / 10')
  })


  test('[TS888-012]: Verify Game Over After 10 Incorrect Attempts (Lose Condition)', async ({ page }) => {
    const inputGuesses = [1, 2, 3, 50, 40, 39, 15, 14, 9, 11]

    for (let i = 0; i < inputGuesses.length; i++) {
      const guess = inputGuesses[i];
      let attemptsCount = i + 1

      await page.getByTestId('guessField').fill(guess.toString())
      await page.getByTestId('guessButton').click()

      await expect(page.getByTestId('showAttempts')).toHaveText(attemptsCount + ' / 10')
      await expect(page.locator('#guesses > span')).toHaveCount(attemptsCount)
    }

    await expect.soft(page.locator('#card')).toContainClass('flipped')
    await expect(page.getByTestId('cardValue')).toHaveText('12')

    await expect(page.getByTestId('messageArea')).toHaveText("Game Over! You've used all your attempts.")
    await expect(page.getByTestId('reset')).toHaveText('RESET')
    await expect(page.getByTestId('reset')).toBeEnabled()
    await expect(page.getByTestId('guessField')).toBeDisabled()
  })


  test('[TS888-013]: Verify "RESET" Button Functionality After Win', async ({ page }) => {
    let correctNum = '12'
    await page.getByTestId('guessField').fill(correctNum)
    await page.getByTestId('guessButton').click()

    await expect(page.getByTestId('reset')).toHaveText('RESET')
    await expect(page.getByTestId('guessField')).toBeDisabled()
    await expect(page.getByTestId('reset')).toBeEnabled()
    await page.reload()

    //Initial State
    await expect(page.locator('#card')).toBeVisible()
    await expect(page.locator('#frontCardTitle')).toContainText('Guess the card value')
    await expect(page.locator('#frontCardValue')).toContainText('**')
    await expect(page.getByTestId('guessField')).toBeFocused()
    await expect(page.getByTestId('guessField')).toBeEmpty()
    await expect(page.getByTestId('guessField')).toBeEnabled()
    await expect(page.getByTestId('guessButton')).toBeDisabled()
    await expect(page.getByTestId('guessButton')).toHaveText('GUESS')
    await expect(page.locator('#instruction')).toHaveText('Enter the number here')
    await expect(page.getByTestId('messageArea')).toBeEmpty()
    await expect(page.getByTestId('prevGuesses')).toBeVisible()
    await expect(page.getByTestId('miscTitle')).toHaveText('guesses')
    await expect(page.getByTestId('guesses')).toBeEmpty()
    await expect(page.getByTestId('attempts')).toBeVisible()
    await expect(page.getByTestId('attemptsTitle')).toHaveText('ATTEMPTS')
    await expect(page.getByTestId('showAttempts')).toBeHidden()

  })


  test('[TS888-014]: Verify "RESET" Button Functionality After Loss (via enter key)', async ({ page }) => {
    const inputGuesses = [50, 39, 11, 4, 29, 20, 15, 1, 8, 10]

    for (let i = 0; i < inputGuesses.length; i++) {
      const guess = inputGuesses[i];
      let attemptsCount = i + 1

      await page.getByTestId('guessField').fill(guess.toString())
      await page.getByTestId('guessField').press('Enter')

      await expect(page.getByTestId('showAttempts')).toHaveText(attemptsCount + ' / 10')
      await expect(page.locator('#guesses > span')).toHaveCount(attemptsCount)
    }

    await expect.soft(page.locator('#card')).toContainClass('flipped')
    await expect(page.getByTestId('cardValue')).toHaveText('12')

    await expect(page.getByTestId('messageArea')).toHaveText("Game Over! You've used all your attempts.")
    await expect(page.getByTestId('reset')).toHaveText('RESET')
    await expect(page.getByTestId('reset')).toBeEnabled()
    await expect(page.getByTestId('guessField')).toBeDisabled()

    await page.getByTestId('reset').press('Enter')
    await page.reload()

    //Initial State
    await expect(page.locator('#card')).toBeVisible()
    await expect(page.locator('#frontCardTitle')).toContainText('Guess the card value')
    await expect(page.locator('#frontCardValue')).toContainText('**')
    await expect(page.getByTestId('guessField')).toBeFocused()
    await expect(page.getByTestId('guessField')).toBeEmpty()
    await expect(page.getByTestId('guessField')).toBeEnabled()
    await expect(page.getByTestId('guessButton')).toBeDisabled()
    await expect(page.getByTestId('guessButton')).toHaveText('GUESS')
    await expect(page.locator('#instruction')).toHaveText('Enter the number here')
    await expect(page.getByTestId('messageArea')).toBeEmpty()
    await expect(page.getByTestId('prevGuesses')).toBeVisible()
    await expect(page.getByTestId('miscTitle')).toHaveText('guesses')
    await expect(page.getByTestId('guesses')).toBeEmpty()
    await expect(page.getByTestId('attempts')).toBeVisible()
    await expect(page.getByTestId('attemptsTitle')).toHaveText('ATTEMPTS')
    await expect(page.getByTestId('showAttempts')).toBeHidden()
  })


  test('[TS888-015]: Verify Attempts Counter Increments Only on Valid Guesses', async ({ page }) => {
    const inputNum = [0, 60, 5, 30, 12]
    let validCount = 0

    for (let i = 0; i < inputNum.length; i++) {
      const currentValue = inputNum[i];

      await page.getByTestId('guessField').fill(currentValue.toString())
      await page.getByTestId('guessButton').click()

      if (currentValue < 1 || currentValue > 50) {
        await expect(page.getByTestId('showAttempts')).toHaveText(0 + ' / 10')
        await expect(page.locator('#guesses > span')).toHaveCount(0)
      } else {
        validCount++
        
        await expect(page.getByTestId('showAttempts')).toHaveText(validCount + ' / 10')
        await expect(page.locator('#guesses > span')).toHaveCount(validCount)
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
      await page.getByTestId('guessField').fill(value.num)
      await page.getByTestId('guessButton').click()

      await expect(page.getByTestId('guessField')).toBeEmpty()
      await expect(page.getByTestId('messageArea')).toHaveText(value.expectedResult)
  
      await expect(page.locator('#guesses > span').nth(i)).toHaveText(value.num)
    }
  })


  test('TS888-017]: Verify Input via Keyboard "Enter" Key', async ({ page }) => {
    await page.getByTestId('guessField').fill('1')
    await page.getByTestId('guessField').press('Enter')
    await expect(page.getByTestId('messageArea')).toHaveText('My number is larger.\n Try Again!')
    await expect(page.getByTestId('guessField')).toBeEmpty()
    await expect(page.getByTestId('guessField')).toBeFocused()
    await expect(page.getByTestId('showAttempts')).toHaveText('1  / 10')
    await expect(page.locator('#guesses > span')).toHaveCount(1)
  })


  test('[TS888-018]: Verify Previous Guesses Styling and Order', async ({ page }) => {
    const inputGuesses = [25, 10, 12]

    for (let i = 0; i < inputGuesses.length; i++) {
      const guess = inputGuesses[i];
      await page.getByTestId('guessField').fill(guess.toString())
      await page.getByTestId('guessButton').click()

      let attemptsCount = (i + 1)

      await expect(page.getByTestId('guesses').locator('> span')).toHaveCount(attemptsCount)
      await expect(page.locator('.rotateAttempt')).toHaveText(attemptsCount.toString())

      if (guess == 12) {
        await expect(page.locator('#guesses > span').nth(i)).toHaveText(inputGuesses[i].toString())
        await expect(page.locator('#guesses > span').nth(i)).toContainClass('boxed')
        await expect(page.locator('#guesses > span').nth(i)).toContainClass('guessed')
      } else {
        await expect(page.locator('#guesses > span').nth(i)).toHaveText(inputGuesses[i].toString())
        await expect(page.locator('#guesses > span').nth(i)).toContainClass('boxed')
        await expect(page.locator('#guesses > span').nth(i)).not.toContainClass('guessed')
      }
    }
  })


  test('[TS888-019]: Verify Mixed Out-of-Range and Valid Attempts Count', async ({ page }) => {
    const inputNum = [0, 60, 5, 30, 12]
    let validCount = 0

    for (let i = 0; i < inputNum.length; i++) {
      const currentValue = inputNum[i];

      await page.getByTestId('guessField').fill(currentValue.toString())
      await page.getByTestId('guessButton').click()

      if (currentValue < 1 || currentValue > 50) {
        await expect(page.getByTestId('messageArea')).toHaveText('ERROR:Input should be between 1 & 50')
      } else {
        validCount++

        await expect(page.getByTestId('guesses').locator('> span')).toHaveCount(validCount)
        await expect(page.locator('.rotateAttempt')).toHaveText(validCount.toString())
      }
    }
  })

  test('[TS888-020]: Verify guess field is focused if mouse is use', async ({ page }) => {
    await page.getByTestId('guessField').click()
    await expect(page.getByTestId('guessField')).toBeFocused()
  })

})