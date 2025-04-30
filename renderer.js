function handleSubmit(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get the values from the input fields
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const data = {
        name: name,
        email: email
    }
    window.electronAPI.setData(data)
}

async function handleOpenFile(event) {
    const filePath = await window.electronAPI.openFile()
    console.log(filePath);
    document.getElementById('name').value = filePath;
}

const counter = document.getElementById('counter')

window.electronAPI.onUpdateCounter((value) => {
    const oldValue = Number(counter.innerText)
    const newValue = oldValue + value
    counter.innerText = newValue.toString()
    window.electronAPI.counterValue(newValue)
})

const toggle = document.getElementById('toggle');
const dot = document.querySelector('.dot');
const toggleBlock = document.querySelector('.block');

toggle.addEventListener('change', async () => {
    const isDarkMode = await window.electronAPI.toggleMode();
    console.log(isDarkMode);
    if (toggle.checked) {
        dot.classList.add('translate-x-6');
        toggleBlock.classList.add('bg-blue-500');
        toggleBlock.classList.remove('bg-gray-300');

    } else {
        dot.classList.remove('translate-x-6');
        toggleBlock.classList.remove('bg-blue-500');
        toggleBlock.classList.add('bg-gray-300');
    }
});

function handleKeyPress(event) {
    document.getElementById('last-keypress').innerText = event.key
}

window.addEventListener('keyup', handleKeyPress, true)
