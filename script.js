const input = document.getElementById('main-input');
const upload = document.getElementById('upload');
const send = document.getElementById('send');
const historyBtn = document.getElementById('history');
const output = document.getElementById('output');
const image = output.querySelector('img');
const extractedColors = output.querySelector('#extracted-colors');
const jsonResponse = output.querySelector('#json-response');

send.addEventListener('click', () => {
    if (input.value.trim() == '') {
        popup('Paste an image URL or an image from the clipboard');
        return;
    }

    getData(input.value);
});
upload.addEventListener('click', () => {
    const file = document.createElement('input');
    file.type = 'file';
    file.accept = 'image/*';
    file.click();

    file.addEventListener('change', () => {
        const fr = new FileReader();
        fr.onload = function () {
            getData(fr.result);
        }
        fr.readAsDataURL(file.files[0]);
    });
});
window.addEventListener('paste', e => {
    const items = (e.clipboardData || window.clipboardData).items;

    for (let index in items) {
        const item = items[index];
        if (item.kind === 'file' && item.type.indexOf('image') !== -1) {
            const blob = item.getAsFile();
            const fr = new FileReader();
            fr.onload = function () {
                getData(fr.result);
            }
            fr.readAsDataURL(blob);
        }
    }
});

input.addEventListener('keyup', e => {
    if (e.key == 'Enter') send.click();
});

let openColorTool = null;
let openColor = null;

function getData(imageUrl) {
    let previousSend = send.innerHTML;
    send.innerHTML = '<span class="material-symbols-outlined">rotate_right</span>';
    send.classList.add('progress');
    send.setAttribute('disabled', '');
    popup('Loading image');

    fetch('https://colorharvest.darksidex37.repl.co', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageUrl: imageUrl })
    })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            let history = localStorage.getItem('history');

            if (history) {
                history = JSON.parse(history);
            } else {
                history = [];
            }

            const date = new Date();
            history.push({
                url: imageUrl,
                date: date.toLocaleDateString(),
                time: date.toLocaleTimeString()
            });
            localStorage.setItem('history', JSON.stringify(history));

            send.innerHTML = previousSend;
            send.removeAttribute('disabled');
            send.classList.remove('progress');
            image.src = data.image;

            for (let i in data.colors) {
                const color = document.createElement('div');
                color.classList.add('extracted-color');
                color.style.backgroundColor = data.colors[i].hex;
                color.title = 'Open the color tool';
                extractedColors.appendChild(color);

                color.addEventListener('click', () => {
                    if (openColorTool && openColor === color) {
                        openColorTool.remove();
                        openColorTool = null;
                        openColor = null;
                    } else {
                        if (openColorTool) {
                            openColorTool.remove();
                        }

                        const colorTool = document.createElement('div');
                        colorTool.classList.add('color-tool');
                        colorTool.innerHTML = `
                        <h3>HEX</h3>
                        <div class="palette">
                            <div class="color-palette hex">${data.colors[i].hex}</div>
                            <button class="icon-button copy-color" data-ripple="true" title="Copy to clipboard"><span class="material-symbols-outlined">content_copy</span></div>
                        </div>
                        <h3>RGB</h3>
                        <div class="palette">
                            <div class="rgb multi-palette">
                                <div class="color-palette">${data.colors[i].rgb[0]}</div>
                                <div class="color-palette">${data.colors[i].rgb[1]}</div>
                                <div class="color-palette">${data.colors[i].rgb[2]}</div>
                            </div>
                            <button class="icon-button copy-color" data-ripple="true" title="Copy to clipboard"><span class="material-symbols-outlined">content_copy</span></div>
                        </div>
                        <h3>HSL</h3>
                        <div class="palette">
                            <div class="hsl multi-palette">
                                <div class="color-palette">${data.colors[i].hsl[0].toFixed(2)}</div>
                                <div class="color-palette">${data.colors[i].hsl[1].toFixed(2)}</div>
                                <div class="color-palette">${data.colors[i].hsl[2].toFixed(2)}</div>
                            </div>
                            <button class="icon-button copy-color" data-ripple="true" title="Copy to clipboard"><span class="material-symbols-outlined">content_copy</span></div>
                        </div>
                        `;
                        document.body.appendChild(colorTool);

                        colorTool.querySelectorAll('.copy-color').forEach((copyBtn, index) => {
                            copyBtn.addEventListener('click', () => {
                                let colorValue;

                                if (index === 0) {
                                    colorValue = data.colors[i].hex; // HEX
                                } else if (index === 1) {
                                    colorValue = data.colors[i].rgb.join(', '); // RGB
                                } else if (index === 2) {
                                    colorValue = data.colors[i].hsl.join(', '); // HSL
                                }

                                navigator.clipboard.writeText(colorValue);
                                popup('Copied to clipboard');
                            });
                        });

                        colorToolPos();
                        window.addEventListener('resize', colorToolPos);

                        openColorTool = colorTool;
                        openColor = color;

                        function colorToolPos() {
                            colorTool.style.top = `${color.offsetTop + color.offsetHeight + 3}px`;
                            let leftPos = color.offsetLeft;
                            let toolWidth = colorTool.offsetWidth;
                            let pageWidth = window.innerWidth;

                            if (leftPos + toolWidth > pageWidth) {
                                leftPos = pageWidth - toolWidth - 20;
                            }

                            colorTool.style.left = `${leftPos}px`;
                        }
                    }
                });
            }

            jsonResponse.innerHTML = `<code class="json">${JSON.stringify(data, null, 2)}</code>`;
            jsonResponse.style.display = 'block';

            const highlightedCode = hljs.highlight(jsonResponse.innerText, { language: 'json' }).value;
            jsonResponse.innerHTML = `<code class="json">${highlightedCode}</code>`;
            popup('Image loaded');
        })
        .catch(error => {
            popup(`An error occurred: ${error.message}`);

            send.innerHTML = previousSend;
            send.removeAttribute('disabled');
            send.classList.remove('progress');
        });
}

historyBtn.addEventListener('click', () => {
    const historyPanel = document.createElement('div');
    historyPanel.innerHTML = `
    <button id="close-history" class="icon-button" title="Close"><span class="material-symbols-outlined">close</span></button>
    <div id="saved-images"></div>
    `;
    historyPanel.classList.add('history-panel');
    document.body.appendChild(historyPanel);

    const savedImages = historyPanel.querySelector('#saved-images');

    let history = localStorage.getItem('history');

    if (history) {
        history = JSON.parse(history);

        for (let item of history) {
            const container = document.createElement('div');
            container.classList.add('history-container');

            const img = document.createElement('img');
            img.src = item.url;
            img.title = `Date: ${item.date}, Time: ${item.time}`;
            img.width = 150;

            const deleteIcon = document.createElement('span');
            deleteIcon.innerHTML = '<span class="material-symbols-outlined">delete</span>';
            deleteIcon.classList.add('delete-icon');
            deleteIcon.title = 'Remove';

            if (!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                container.addEventListener('mouseover', () => {
                    deleteIcon.style.display = 'block';
                });

                container.addEventListener('mouseout', () => {
                    deleteIcon.style.display = 'none';
                });
            } else {
                deleteIcon.style.display = 'none';

                container.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    deleteIcon.style.display = deleteIcon.style.display == 'none' ? 'block' : 'none';
                });
            }

            deleteIcon.addEventListener('click', () => {
                const index = history.findIndex(h => h.url === item.url);

                if (index !== -1) {
                    history.splice(index, 1);
                    localStorage.setItem('history', JSON.stringify(history));
                    container.remove();
                }

                popup('Removed an image from the history');
            });

            container.appendChild(img);
            container.appendChild(deleteIcon);

            savedImages.appendChild(container);
        }
    }

    savedImages.querySelectorAll('img').forEach(img => {
        img.addEventListener('click', () => {
            getData(img.src);
            closeHistory();
        });
    });

    setTimeout(() => {
        historyPanel.style.right = 0;
    });

    historyPanel.querySelector('#close-history').addEventListener('click', closeHistory);

    function closeHistory() {
        historyPanel.style.removeProperty('right');

        setTimeout(() => {
            historyPanel.remove();
        }, 200);
    }
});

image.addEventListener('click', () => {
    const fullscreenMode = document.createElement('div');
    fullscreenMode.innerHTML = `<img src="${image.src}" width="500" alt="">`;
    fullscreenMode.classList.add('fullscreen');
    document.body.appendChild(fullscreenMode);

    const img = fullscreenMode.querySelector('img');

    setTimeout(() => {
        fullscreenMode.style.opacity = 1;
        img.style.transform = 'scale(1)';
    });

    fullscreenMode.addEventListener('click', e => {
        if (e.target == fullscreenMode) {
            fullscreenMode.style.opacity = 0;
            img.style.transform = 'scale(.8)';

            setTimeout(() => fullscreenMode.remove(), 200);
        }
    });
});

let popupTimeout;

function popup(message = 'New Message', timeout = 3) {
    if (popupTimeout) {
        clearTimeout(popupTimeout);
        const existingPopup = document.querySelector('.message');
        if (existingPopup) existingPopup.remove();
    }

    const msg = document.createElement('div');
    msg.textContent = message;
    msg.classList.add('message');
    document.body.appendChild(msg);

    setTimeout(() => {
        msg.style.opacity = 1;
        msg.style.transform = 'translateX(-50%) scale(1)';
    });

    let ms = 1000;

    popupTimeout = setTimeout(() => {
        msg.style.transform = 'translate(-50%) scale(.8)';
        msg.style.opacity = 0;

        setTimeout(() => msg.remove(), timeout * ms);
    }, timeout * ms);
}

document.body.addEventListener('click', e => {
    const btn = e.target.closest('[data-ripple="true"]');
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    btn.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
});