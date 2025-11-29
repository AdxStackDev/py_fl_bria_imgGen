document.addEventListener('DOMContentLoaded', () => {
    // --- Constants ---
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
    const MAX_PROMPT_LENGTH = 2000;
    const REQUEST_TIMEOUT = 60000; // 60 seconds

    // --- DOM Elements ---
    const elements = {
        enhanceBtn: document.getElementById('enhance-btn'),
        promptInput: document.getElementById('prompt-input'),
        promptResultContainer: document.getElementById('prompt-result-container'),
        promptResult: document.getElementById('prompt-result'),
        clearPromptBtn: document.getElementById('clear-prompt'),

        generateBtn: document.getElementById('generate-btn'),
        imagePromptInput: document.getElementById('image-prompt-input'),
        imageResultContainer: document.getElementById('image-result-container'),
        imageTimer: document.getElementById('image-timer'),
        imageResult: document.getElementById('image-result'),
        clearImagePromptBtn: document.getElementById('clear-image-prompt'),

        removebgBtn: document.getElementById('removebg-btn'),
        bgImageInput: document.getElementById('bg-image-input'),
        removebgResultContainer: document.getElementById('removebg-result-container'),
        removebgTimer: document.getElementById('removebg-timer'),
        removebgResult: document.getElementById('removebg-result'),
        fileNameDisplay: document.getElementById('file-name')
    };

    // Validate all required elements exist (except optional removebg elements)
    const optionalElements = ['removebgBtn', 'bgImageInput', 'removebgResultContainer', 'removebgTimer', 'removebgResult', 'fileNameDisplay'];
    Object.entries(elements).forEach(([key, element]) => {
        if (!element && !optionalElements.includes(key)) {
            console.error(`Required element not found: ${key}`);
        }
    });

    // --- State Management ---
    const timers = new Map(); // Prevents race conditions
    const abortControllers = new Map(); // For request cancellation

    // --- Helper Functions ---
    const escapeHtml = (unsafe) => {
        const div = document.createElement('div');
        div.textContent = unsafe;
        return div.innerHTML;
    };

    const startTimer = (timerId, element) => {
        // Stop existing timer if any
        if (timers.has(timerId)) {
            clearInterval(timers.get(timerId));
        }

        let seconds = 0;
        element.textContent = 'Processing... 0s';

        const interval = setInterval(() => {
            seconds++;
            element.textContent = `Processing... ${seconds}s`;
        }, 1000);

        timers.set(timerId, interval);
    };

    const stopTimer = (timerId, element) => {
        if (timers.has(timerId)) {
            clearInterval(timers.get(timerId));
            timers.delete(timerId);
        }
        if (element) {
            element.textContent = '';
        }
    };

    const showAlert = (title, text, icon) => {
        Swal.fire({
            title: escapeHtml(title),
            text: escapeHtml(text),
            icon: icon,
            confirmButtonColor: '#667eea',
            background: 'rgba(255, 255, 255, 0.95)',
            backdrop: 'rgba(0, 0, 0, 0.7)'
        });
    };

    const validateFile = (file) => {
        if (!file) {
            return { valid: false, error: 'No file selected' };
        }

        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            return {
                valid: false,
                error: `Invalid file type. Allowed: ${ALLOWED_FILE_TYPES.join(', ')}`
            };
        }

        if (file.size > MAX_FILE_SIZE) {
            return {
                valid: false,
                error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`
            };
        }

        return { valid: true };
    };

    const validatePrompt = (text) => {
        if (!text || text.trim().length === 0) {
            return { valid: false, error: 'Prompt cannot be empty' };
        }

        if (text.length > MAX_PROMPT_LENGTH) {
            return {
                valid: false,
                error: `Prompt too long. Maximum ${MAX_PROMPT_LENGTH} characters`
            };
        }

        return { valid: true };
    };

    const createDownloadButton = (url) => {
        const downloadBtn = document.createElement('button');
        downloadBtn.innerHTML = '<span>⬇️ Download Image</span>';
        downloadBtn.className = 'mt-3 w-full py-3 rounded-xl font-semibold text-base transition-all duration-300 relative overflow-hidden';
        downloadBtn.style.cssText = 'background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; border: none;';

        downloadBtn.addEventListener('mouseover', () => {
            downloadBtn.style.transform = 'translateY(-2px)';
            downloadBtn.style.boxShadow = '0 10px 30px rgba(67, 233, 123, 0.4)';
        });

        downloadBtn.addEventListener('mouseout', () => {
            downloadBtn.style.transform = 'translateY(0)';
            downloadBtn.style.boxShadow = 'none';
        });

        downloadBtn.addEventListener('click', async () => {
            try {
                downloadBtn.disabled = true;
                downloadBtn.innerHTML = '<span>⏳ Downloading...</span>';

                const response = await fetch(url);
                if (!response.ok) throw new Error('Download failed');

                const blob = await response.blob();
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `bria_ai_${Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                link.remove();
                URL.revokeObjectURL(link.href);

                showAlert('Success!', 'Image downloaded successfully', 'success');
            } catch (error) {
                console.error('Download error:', error);
                showAlert('Download Failed', 'Could not download the image. Please try again.', 'error');
            } finally {
                downloadBtn.disabled = false;
                downloadBtn.innerHTML = '<span>⬇️ Download Image</span>';
            }
        });

        return downloadBtn;
    };

    const fetchWithTimeout = async (url, options = {}) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Request timeout. Please try again.');
            }
            throw error;
        }
    };

    const setButtonLoading = (button, isLoading) => {
        if (isLoading) {
            button.disabled = true;
            button.style.opacity = '0.7';
            button.style.cursor = 'not-allowed';
        } else {
            button.disabled = false;
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
        }
    };

    // --- Event Listeners for Clear Buttons ---
    elements.clearPromptBtn.addEventListener('click', () => {
        elements.promptInput.value = '';
        elements.promptInput.focus();
    });

    elements.clearImagePromptBtn.addEventListener('click', () => {
        elements.imagePromptInput.value = '';
        elements.imagePromptInput.focus();
    });

    if (elements.bgImageInput) {
        elements.bgImageInput.addEventListener('change', () => {
            const file = elements.bgImageInput.files[0];
            if (file) {
                const validation = validateFile(file);
                if (!validation.valid) {
                    showAlert('Invalid File', validation.error, 'error');
                    elements.bgImageInput.value = '';
                    if (elements.fileNameDisplay) {
                        elements.fileNameDisplay.textContent = 'PNG, JPG, JPEG (Max 10MB)';
                    }
                } else {
                    if (elements.fileNameDisplay) {
                        elements.fileNameDisplay.textContent = file.name;
                    }
                }
            } else {
                if (elements.fileNameDisplay) {
                    elements.fileNameDisplay.textContent = 'PNG, JPG, JPEG (Max 10MB)';
                }
            }
        });
    }

    // --- Feature 1: Prompt Enhancer ---
    elements.enhanceBtn.addEventListener('click', async () => {
        const text = elements.promptInput.value.trim();

        const validation = validatePrompt(text);
        if (!validation.valid) {
            showAlert('Input Required', validation.error, 'warning');
            return;
        }

        elements.promptResultContainer.classList.remove('hidden');
        elements.promptResult.innerHTML = '<p class="text-gray-300 loading">✨ Enhancing your prompt...</p>';
        setButtonLoading(elements.enhanceBtn, true);

        try {
            const response = await fetchWithTimeout(`/prompt/${encodeURIComponent(text)}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to enhance prompt.');
            }

            const originalEscaped = escapeHtml(data.original_prompt || text);
            const enhancedEscaped = escapeHtml(data.enhanced_prompt || 'No enhancement available');
            const enhancedPrompt = data.enhanced_prompt || 'No enhancement available';

            elements.promptResult.innerHTML = `
                <p class="mb-3"><strong class="text-purple-300">Original:</strong></p>
                <p class="text-gray-200 mb-4 pl-4 border-l-2 border-purple-500">${originalEscaped}</p>
                <div class="flex items-center justify-between mb-3">
                    <strong class="text-pink-300">Enhanced:</strong>
                    <button id="copy-enhanced-btn" class="px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none;">
                        📋 Copy
                    </button>
                </div>
                <p class="text-gray-100 pl-4 border-l-2 border-pink-500">${enhancedEscaped}</p>
            `;

            // Add copy functionality
            const copyBtn = document.getElementById('copy-enhanced-btn');
            if (copyBtn) {
                copyBtn.addEventListener('click', async () => {
                    try {
                        await navigator.clipboard.writeText(enhancedPrompt);
                        copyBtn.innerHTML = '✅ Copied!';
                        copyBtn.style.background = 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';

                        setTimeout(() => {
                            copyBtn.innerHTML = '📋 Copy';
                            copyBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                        }, 2000);
                    } catch (error) {
                        console.error('Failed to copy:', error);
                        showAlert('Copy Failed', 'Could not copy to clipboard. Please try again.', 'error');
                    }
                });
            }
        } catch (error) {
            console.error('Prompt enhancement error:', error);
            elements.promptResult.innerHTML = `<p class="text-red-400">❌ Error: ${escapeHtml(error.message)}</p>`;
        } finally {
            setButtonLoading(elements.enhanceBtn, false);
        }
    });

    // --- Feature 2: Image Generator ---
    elements.generateBtn.addEventListener('click', async () => {
        const text = elements.imagePromptInput.value.trim();

        const validation = validatePrompt(text);
        if (!validation.valid) {
            showAlert('Input Required', validation.error, 'warning');
            return;
        }

        elements.imageResultContainer.classList.remove('hidden');
        elements.imageResult.innerHTML = '';
        startTimer('imageGen', elements.imageTimer);
        setButtonLoading(elements.generateBtn, true);

        try {
            const response = await fetchWithTimeout(`/image/${encodeURIComponent(text)}`);
            const data = await response.json();

            stopTimer('imageGen', elements.imageTimer);

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate image.');
            }

            if (data.image_urls && data.image_urls.length > 0) {
                data.image_urls.forEach((url, index) => {
                    const imgContainer = document.createElement('div');
                    imgContainer.className = 'relative group rounded-xl overflow-hidden animate-fade-in';
                    imgContainer.style.cssText = 'background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); animation-delay: ' + (index * 0.1) + 's; transition: all 0.3s ease;';

                    // Add hover effect
                    imgContainer.addEventListener('mouseenter', () => {
                        imgContainer.style.transform = 'scale(1.02)';
                        imgContainer.style.boxShadow = '0 8px 32px rgba(99, 102, 241, 0.3)';
                    });
                    imgContainer.addEventListener('mouseleave', () => {
                        imgContainer.style.transform = 'scale(1)';
                        imgContainer.style.boxShadow = 'none';
                    });

                    const img = document.createElement('img');
                    img.src = url;
                    img.alt = `Generated image ${index + 1}`;
                    img.className = 'w-full h-auto aspect-square object-cover';
                    img.loading = 'lazy';

                    const downloadBtn = createDownloadButton(url);
                    downloadBtn.className = 'absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4 py-2 rounded-lg font-semibold text-sm';
                    downloadBtn.style.cssText = 'background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; border: none;';

                    imgContainer.appendChild(img);
                    imgContainer.appendChild(downloadBtn);
                    elements.imageResult.appendChild(imgContainer);
                });
            } else {
                elements.imageResult.innerHTML = '<p class="text-gray-300 col-span-2 text-center">No images were generated. Please try a different prompt.</p>';
            }
        } catch (error) {
            console.error('Image generation error:', error);
            stopTimer('imageGen', elements.imageTimer);
            elements.imageResult.innerHTML = `<p class="text-red-400">❌ Error: ${escapeHtml(error.message)}</p>`;
        } finally {
            setButtonLoading(elements.generateBtn, false);
        }
    });

    // --- Feature 3: Background Remover ---
    if (elements.removebgBtn) {
        elements.removebgBtn.addEventListener('click', async () => {
            const imageFile = elements.bgImageInput.files[0];

            const validation = validateFile(imageFile);
            if (!validation.valid) {
                showAlert('Invalid File', validation.error, 'warning');
                return;
            }

            elements.removebgResultContainer.classList.remove('hidden');
            elements.removebgResult.innerHTML = '';
            startTimer('removeBg', elements.removebgTimer);
            setButtonLoading(elements.removebgBtn, true);

            const formData = new FormData();
            formData.append('image', imageFile);

            try {
                const response = await fetchWithTimeout('/removebg', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();

                stopTimer('removeBg', elements.removebgTimer);

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to remove background.');
                }

                if (data.url) {
                    const imgContainer = document.createElement('div');
                    imgContainer.className = 'relative p-4 rounded-2xl';
                    imgContainer.style.cssText = 'background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1);';

                    const img = document.createElement('img');
                    img.src = data.url;
                    img.alt = 'Background removed image';
                    img.className = 'w-full rounded-xl shadow-lg';
                    img.style.cssText = 'border: 1px solid rgba(255, 255, 255, 0.1);';
                    img.loading = 'lazy';

                    const downloadBtn = createDownloadButton(data.url);

                    imgContainer.appendChild(img);
                    imgContainer.appendChild(downloadBtn);
                    elements.removebgResult.appendChild(imgContainer);
                } else {
                    elements.removebgResult.innerHTML = '<p class="text-gray-300">Could not process the image. Please try again.</p>';
                }
            } catch (error) {
                console.error('Background removal error:', error);
                stopTimer('removeBg', elements.removebgTimer);
                elements.removebgResult.innerHTML = `<p class="text-red-400">❌ Error: ${escapeHtml(error.message)}</p>`;
            } finally {
                setButtonLoading(elements.removebgBtn, false);
            }
        });
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        timers.forEach(timer => clearInterval(timer));
        abortControllers.forEach(controller => controller.abort());
    });
});
