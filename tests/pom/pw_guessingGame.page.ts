import { Locator, Page } from "@playwright/test"; 

export default class guessingGame {
    page: Page
    getContainer1: Locator
    getFrontCardTitle: Locator
    getFrontCardValue: Locator
    getMainContainer: Locator
    getGuessField: Locator
    getGuessButton: Locator
    getTooltip: Locator
    getMessage: Locator
    getGuessContainer: Locator
    getGuessTitle: Locator
    getGuessList: Locator
    getAttemptContainer: Locator
    getAttemptTitle: Locator
    getShowAttempt: Locator
    getCorrectNum: Locator
    getResetButton: Locator
    getGuessValue: Locator


    constructor(page: Page){
        this.page = page

        this.getContainer1 = page.locator('#card')
        this.getFrontCardTitle = page.locator('#frontCardTitle')
        this.getFrontCardValue = page.locator('#frontCardValue')
        this.getCorrectNum = page.getByTestId('cardValue')

        this.getMainContainer = page.locator('#main')
        this.getGuessField = page.getByTestId('guessField')
        this.getGuessButton = page.getByTestId('guessButton')
        this.getResetButton = page.getByTestId('reset')
        this.getTooltip = page.locator('#instruction')

        this.getMessage = page.getByTestId('messageArea')
        this.getGuessContainer = page.getByTestId('prevGuesses')
        this.getGuessTitle = page.getByTestId('miscTitle')
        this.getGuessList = page.getByTestId('guesses')
        this.getGuessValue = page.locator('#guesses > span')

        this.getAttemptContainer = page.getByTestId('attempts')
        this.getAttemptTitle = page.getByTestId('attemptsTitle')
        this.getShowAttempt = page.getByTestId('showAttempts')
    }

    gameStart = async (num: any) => {
        await this.getGuessField.fill(num)
        await this.getGuessButton.click()
    }

}