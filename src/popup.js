document.addEventListener('DOMContentLoaded', async () => {
    // Inject script into the active tab to fetch focused input text
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

    chrome.scripting.executeScript(
        {
            target: { tabId: tab.id },
            func: getFocusedInputValue,
        },
        (results) => {
            const resultText = results[0]?.result || 'No focused input found.'
            document.getElementById('focusedText').value = resultText
        }
    )
})

// Function executed in the context of the webpage
function getFocusedInputValue() {
    const activeElement = document.activeElement
    if (
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA')
    ) {
        return activeElement.value
    }
    return ''
}

document.addEventListener('DOMContentLoaded', () => {
    const year = new Date().getFullYear()
    const yearRange = year > 2023 ? `2023 - ${year}` : '2023'
    document.getElementById('year-range').textContent = yearRange
})

document.getElementById('copyOutput').addEventListener('click', () => {
    const outputText = document.getElementById('outputText')

    // Using Clipboard API to copy the text to the clipboard
    navigator.clipboard
        .writeText(outputText.value)
        .then(() => {
            const copyButton = document.getElementById('copyOutput')
            copyButton.textContent = 'Copied!'
            copyButton.style.backgroundColor = 'green'

            // Reset the button text after 2 seconds
            setTimeout(() => {
                copyButton.textContent = 'Copy output'
                copyButton.style.backgroundColor = '#4CAF50'
            }, 2000)
        })
        .catch((err) => {
            console.error('Error copying text: ', err)
        })
})

document.getElementById('focusedText').addEventListener('click', () => {
    const focusedText = document.getElementById('focusedText')
    const printText = document.getElementById('printText')
    const outputWrapper = document.getElementById('outputWrapper')

    focusedText.style.height = `150px`
    printText.style.display = 'block'
    outputWrapper.style.maxHeight = '0px'
})

document.getElementById('printText').addEventListener('click', () => {
    const focusedText = document.getElementById('focusedText')
    const outputText = document.getElementById('outputText')
    const outputWrapper = document.getElementById('outputWrapper')
    const printText = document.getElementById('printText')
    const optionsWrapper = document.getElementById('optionsWrapper')
    const bType = document.getElementById('bType')
    const htmlFormatCheckbox = document.getElementById('htmlFormat')
    const loaderContainer = document.getElementById('loader')

    // Get text from focusedText and set it to outputText
    const text = focusedText.value

    // disable elements while fetching
    printText.setAttribute('disabled', true)

    loaderContainer.style.display = 'block'

    fetch('https://beautify-r4mwwvqesa-uc.a.run.app ', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            text,
            type: bType.value,
            formatAsHtml: htmlFormatCheckbox.checked,
        }),
    })
        .then((data) => data.text())
        .then((data) => {
            outputText.value = data
        })
        .finally(() => {
            printText.style.display = 'none'
            focusedText.style.height = '0px'
            outputWrapper.style.maxHeight = '300px'
            optionsWrapper.style.display = 'none'
            loaderContainer.style.display = 'none'
            printText.removeAttribute('disabled')
        })
})
