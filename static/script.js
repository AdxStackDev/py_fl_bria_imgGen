document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const enhanceBtn = document.getElementById('enhance-btn');
    const promptInput = document.getElementById('prompt-input');
    const promptResult = document.getElementById('prompt-result');

    const generateBtn = document.getElementById('generate-btn');
    const imagePromptInput = document.getElementById('image-prompt-input');
    const imageResult = document.getElementById('image-result');

    const removebgBtn = document.getElementById('removebg-btn');
    const bgImageInput = document.getElementById('bg-image-input');
    const removebgResult = document.getElementById('removebg-result');

    // --- Helper to show loading ---
    const showLoading = (element) => {
        element.innerHTML = 'Loading...';
    };

    // --- Feature 1: Prompt Enhancer ---
    enhanceBtn.addEventListener('click', async () => {
        const text = promptInput.value.trim();
        if (!text) {
            alert('Please enter a prompt.');
            return;
        }

        showLoading(promptResult);

        try {
            const response = await fetch(`/prompt/${encodeURIComponent(text)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            promptResult.innerHTML = `
                <strong>Original:</strong> ${data.original_prompt}<br>
                <strong>Enhanced:</strong> ${data.enhanced_prompt}
            `;
        } catch (error) {
            promptResult.innerHTML = `Error: ${error.message}`;
        }
    });

    // --- Feature 2: Image Generator ---
    generateBtn.addEventListener('click', async () => {
        const text = imagePromptInput.value.trim();
        if (!text) {
            alert('Please enter a prompt for image generation.');
            return;
        }

        showLoading(imageResult);

        try {
            const response = await fetch(`/image/${encodeURIComponent(text)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.image_urls && data.image_urls.length > 0) {
                imageResult.innerHTML = '';
                data.image_urls.forEach(url => {
                    const img = document.createElement('img');
                    img.src = url;
                    imageResult.appendChild(img);
                });
            } else {
                imageResult.innerHTML = 'No images generated.';
            }
        } catch (error) {
            imageResult.innerHTML = `Error: ${error.message}`;
        }
    });

    // --- Feature 3: Background Remover ---
    removebgBtn.addEventListener('click', async () => {
        const imageFile = bgImageInput.files[0];
        if (!imageFile) {
            alert('Please select an image file.');
            return;
        }

        showLoading(removebgResult);

        const formData = new FormData();
        formData.append('image', imageFile);

        try {
            const response = await fetch('/removebg', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.url) {
                removebgResult.innerHTML = `<img src="${data.url}" alt="Background removed image">`;
            } else {
                removebgResult.innerHTML = 'Error: Could not process image.';
            }
        } catch (error) {
            removebgResult.innerHTML = `Error: ${error.message}`;
        }
    });
});
