document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const enhanceBtn = document.getElementById('enhance-btn');
    const promptInput = document.getElementById('prompt-input');
    const promptResultContainer = document.getElementById('prompt-result-container');
    const promptResult = document.getElementById('prompt-result');
    const clearPromptBtn = document.getElementById('clear-prompt');

    const generateBtn = document.getElementById('generate-btn');
    const imagePromptInput = document.getElementById('image-prompt-input');
    const imageResultContainer = document.getElementById('image-result-container');
    const imageTimer = document.getElementById('image-timer');
    const imageResult = document.getElementById('image-result');
    const clearImagePromptBtn = document.getElementById('clear-image-prompt');

    const removebgBtn = document.getElementById('removebg-btn');
    const bgImageInput = document.getElementById('bg-image-input');
    const removebgResultContainer = document.getElementById('removebg-result-container');
    const removebgTimer = document.getElementById('removebg-timer');
    const removebgResult = document.getElementById('removebg-result');
    const fileNameDisplay = document.getElementById('file-name');

    let timerInterval;

    // --- Helper Functions ---
    const startTimer = (element) => {
        let seconds = 0;
        element.textContent = 'Processing... 0s';
        timerInterval = setInterval(() => {
            seconds++;
            element.textContent = `Processing... ${seconds}s`;
        }, 1000);
    };

    const stopTimer = () => {
        clearInterval(timerInterval);
    };

    const showAlert = (title, text, icon) => {
        Swal.fire({
            title: title,
            text: text,
            icon: icon,
            confirmButtonColor: '#3B82F6'
        });
    };

    const createDownloadButton = (url) => {
        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = 'Download Image';
        downloadBtn.className = 'mt-2 w-full bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition';
        downloadBtn.onclick = async () => {
            try {
                // Fetch the image as a blob
                const response = await fetch(url);
                const blob = await response.blob();

                // Create a temporary link to trigger the download
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `generated_image_${Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (e) {
                showAlert('Download Failed', 'Could not download the image.', 'error');
            }
        };
        return downloadBtn;
    };

    // --- Event Listeners for Clear Buttons ---
    clearPromptBtn.addEventListener('click', () => promptInput.value = '');
    clearImagePromptBtn.addEventListener('click', () => imagePromptInput.value = '');
    bgImageInput.addEventListener('change', () => {
        fileNameDisplay.textContent = bgImageInput.files[0] ? bgImageInput.files[0].name : 'PNG, JPG (MAX. 800x400px)';
    });

    // --- Feature 1: Prompt Enhancer ---
    enhanceBtn.addEventListener('click', async () => {
        const text = promptInput.value.trim();
        if (!text) {
            showAlert('Input Required', 'Please enter a prompt to enhance.', 'warning');
            return;
        }

        promptResultContainer.classList.remove('hidden');
        promptResult.innerHTML = 'Enhancing...';

        try {
            const response = await fetch(`/prompt/${encodeURIComponent(text)}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to enhance prompt.');
            }

            promptResult.innerHTML = `
                <p><strong>Original:</strong> ${data.original_prompt}</p>
                <p class="mt-2"><strong>Enhanced:</strong> ${data.enhanced_prompt}</p>
            `;
        } catch (error) {
            promptResult.innerHTML = `<p class="text-red-500">Error: ${error.message}</p>`;
        }
    });

    // --- Feature 2: Image Generator ---
    generateBtn.addEventListener('click', async () => {
        const text = imagePromptInput.value.trim();
        if (!text) {
            showAlert('Input Required', 'Please enter a prompt for image generation.', 'warning');
            return;
        }

        imageResultContainer.classList.remove('hidden');
        imageResult.innerHTML = '';
        startTimer(imageTimer);

        try {
            const response = await fetch(`/image/${encodeURIComponent(text)}`);
            const data = await response.json();

            stopTimer();
            imageTimer.textContent = '';

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate image.');
            }

            if (data.image_urls && data.image_urls.length > 0) {
                data.image_urls.forEach(url => {
                    const imgContainer = document.createElement('div');
                    imgContainer.className = 'relative';

                    const img = document.createElement('img');
                    img.src = url;
                    img.className = 'w-full rounded-lg shadow-md';

                    const downloadBtn = createDownloadButton(url);

                    imgContainer.appendChild(img);
                    imgContainer.appendChild(downloadBtn);
                    imageResult.appendChild(imgContainer);
                });
            } else {
                imageResult.innerHTML = '<p>No images were generated.</p>';
            }
        } catch (error) {
            stopTimer();
            imageTimer.textContent = '';
            imageResult.innerHTML = `<p class="text-red-500">Error: ${error.message}</p>`;
        }
    });

    // --- Feature 3: Background Remover ---
    removebgBtn.addEventListener('click', async () => {
        const imageFile = bgImageInput.files[0];
        if (!imageFile) {
            showAlert('Input Required', 'Please select an image file.', 'warning');
            return;
        }

        removebgResultContainer.classList.remove('hidden');
        removebgResult.innerHTML = '';
        startTimer(removebgTimer);

        const formData = new FormData();
        formData.append('image', imageFile);

        try {
            const response = await fetch('/removebg', { method: 'POST', body: formData });
            const data = await response.json();

            stopTimer();
            removebgTimer.textContent = '';

            if (!response.ok) {
                throw new Error(data.error || 'Failed to remove background.');
            }

            if (data.url) {
                const imgContainer = document.createElement('div');
                imgContainer.className = 'relative';

                const img = document.createElement('img');
                img.src = data.url;
                img.className = 'w-full rounded-lg shadow-md';

                const downloadBtn = createDownloadButton(data.url);

                imgContainer.appendChild(img);
                imgContainer.appendChild(downloadBtn);
                removebgResult.appendChild(imgContainer);
            } else {
                removebgResult.innerHTML = '<p>Could not process the image.</p>';
            }
        } catch (error) {
            stopTimer();
            removebgTimer.textContent = '';
            removebgResult.innerHTML = `<p class="text-red-500">Error: ${error.message}</p>`;
        }
    });
});
