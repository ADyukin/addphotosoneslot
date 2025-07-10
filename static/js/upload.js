document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('file-input');
    const uploadResults = document.getElementById('upload-results');
    
    // Modal elements
    const photoSelectionModal = new bootstrap.Modal(document.getElementById('photoSelectionModal'));
    const cameraModal = new bootstrap.Modal(document.getElementById('cameraModal'));
    const takePhotoOption = document.getElementById('take-photo-option');
    
    // Camera elements
    const cameraVideo = document.getElementById('camera-video');
    const cameraCanvas = document.getElementById('camera-canvas');
    const cameraError = document.getElementById('camera-error');
    const takePhotoBtn = document.getElementById('take-photo-btn');
    const uploadPhotosBtn = document.getElementById('upload-photos-btn');
    const photoCounter = document.getElementById('photo-counter');
    const photoCount = document.getElementById('photo-count');
    
    let currentStream = null;
    let capturedPhotos = [];
    let currentPhotoSection = null;

    // Photo placeholder click handlers
    document.querySelectorAll('.photo-placeholder').forEach(placeholder => {
        placeholder.addEventListener('click', function() {
            if (this.classList.contains('has-photo')) {
                // If already has photo, show remove option or do nothing
                return;
            }
            
            currentPhotoSection = this.dataset.section;
            console.log('Photo placeholder clicked, section:', currentPhotoSection);
            photoSelectionModal.show();
        });
    });

    // Take photo option handler
    takePhotoOption.addEventListener('click', function() {
        setTimeout(() => {
            photoSelectionModal.hide();
            openCamera();
        }, 10);
    });

    // Gallery option handler
    const galleryOption = document.getElementById('gallery-option');
    galleryOption.addEventListener('click', function() {
        setTimeout(() => {
            photoSelectionModal.hide();
            document.getElementById('file-input').click();
        }, 10);
    });

    // --- Новая логика отображения фото и кнопок ---
    const photoGrid = document.getElementById('photo-grid');
    const folderIllustration = document.getElementById('folder-illustration');
    const bottomButtons = document.getElementById('bottom-buttons');
    let photos = [];

    function renderPhotoGrid() {
        // Очистить грид
        photoGrid.innerHTML = '';
        if (photos.length === 0) {
            photoGrid.style.display = 'none';
            folderIllustration.style.display = '';
            // Кнопки: только "Добавить фото"
            bottomButtons.innerHTML = `<button id="add-photo-btn" type="button" class="btn btn-primary w-100 py-3" style="font-weight:600;"><i class="fas fa-camera me-2"></i>Добавить фото</button>`;
        } else {
            photoGrid.style.display = 'grid';
            folderIllustration.style.display = 'none';
            // Кнопки: "Сохранить" и "Добавить ещё фото"
            bottomButtons.innerHTML = `
                <button id="save-btn" type="button" class="btn btn-primary w-100 py-3 mb-2">Сохранить</button>
                <button id="add-photo-btn" type="button" class="btn btn-outline-primary w-100 py-3"> <i class="fas fa-camera me-2"></i>Добавить ещё фото</button>
            `;
        }
        // Нарисовать grid
        photos.forEach((photo, idx) => {
            const item = document.createElement('div');
            item.className = 'photo-grid-item';
            item.innerHTML = `
                <img src="${photo}" alt="Фото ${idx+1}">
                <button class="photo-grid-remove" data-idx="${idx}"><i class="fas fa-times"></i></button>
            `;
            photoGrid.appendChild(item);
        });
    }

    // Обработчик добавления фото
    function handleFilesV2(files) {
        if (!files || files.length === 0) return;
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(ev) {
                photos.push(ev.target.result);
                renderPhotoGrid();
            };
            reader.readAsDataURL(file);
        });
    }

    // Делегирование на удаление фото
    photoGrid.addEventListener('click', function(e) {
        if (e.target.closest('.photo-grid-remove')) {
            const idx = parseInt(e.target.closest('.photo-grid-remove').dataset.idx);
            photos.splice(idx, 1);
            renderPhotoGrid();
        }
    });

    // Делегирование на кнопки снизу
    bottomButtons.addEventListener('click', function(e) {
        if (e.target.closest('#add-photo-btn')) {
            photoSelectionModal.show(); // Открываем модалку выбора способа
        }
        if (e.target.closest('#save-btn')) {
            window.location.href = 'https://www.figma.com/proto/1tVrznxgJ5SN1eJTzQBMsm/%D0%9F%D1%80%D0%BE%D1%82%D0%BE%D1%82%D0%B8%D0%BF%D1%8B?page-id=0%3A1&node-id=1-120294&viewport=-1118%2C107%2C0.73&t=JnlVovtjVZAfDN6M-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=1%3A120294';
        }
    });

    // Переопределяем обработчик file input
    fileInput.addEventListener('change', function(e) {
        handleFilesV2(e.target.files);
        fileInput.value = '';
    });

    // Инициализация
    renderPhotoGrid();

    // Camera functionality
    if (takePhotoBtn) {
        takePhotoBtn.addEventListener('click', function() {
            console.log('Take photo button clicked');
            capturePhoto();
        });
    } else {
        console.error('Take photo button not found');
    }

    if (uploadPhotosBtn) {
        uploadPhotosBtn.addEventListener('click', function() {
            uploadCapturedPhotos();
        });
    }

    // === Добавлено: обработчик для кнопки "Добавить фото" внизу ===
    const addPhotoBtn = document.getElementById('add-photo-btn');
    if (addPhotoBtn) {
        addPhotoBtn.addEventListener('click', function() {
            photoSelectionModal.show();
        });
    }


    // Close camera when modal is hidden
    document.getElementById('cameraModal')?.addEventListener('hidden.bs.modal', function() {
        stopCamera();
    });

    function handleFiles(files) {
        if (files.length === 0) return;

        // Upload files and add to current section
        uploadFiles(files);
    }

    function addPhotoToSection(section, imageUrl, filename) {
        console.log('Adding photo to section:', section, 'filename:', filename);
        const sectionElement = document.querySelector(`[data-section="${section}"]`);
        if (!sectionElement) {
            console.error('Section element not found for section:', section);
            return;
        }

        const photoGrid = sectionElement.closest('.photo-section').querySelector('.photo-grid');
        if (!photoGrid) {
            console.error('Photo grid not found for section:', section);
            return;
        }
        
        // Create new photo element (not placeholder)
        const photoElement = document.createElement('div');
        photoElement.className = 'photo-placeholder has-photo';
        photoElement.dataset.section = section;
        photoElement.innerHTML = `
            <img src="${imageUrl}" alt="${filename}">
            <button class="remove-btn" onclick="removePhoto(this)">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Insert before the main placeholder (always keep it first)
        const mainPlaceholder = photoGrid.querySelector('.photo-placeholder:not(.has-photo)');
        if (mainPlaceholder) {
            photoGrid.insertBefore(photoElement, mainPlaceholder.nextSibling);
        } else {
            photoGrid.appendChild(photoElement);
        }
        
        console.log('Photo added successfully to section:', section);
    }

    function addLoadingPhotoToSection(section, filename) {
        const sectionElement = document.querySelector(`[data-section="${section}"]`);
        if (!sectionElement) return null;

        const photoGrid = sectionElement.closest('.photo-section').querySelector('.photo-grid');
        
        // Create loading photo element
        const photoElement = document.createElement('div');
        photoElement.className = 'photo-placeholder has-photo loading';
        photoElement.dataset.section = section;
        photoElement.innerHTML = `
            <div class="loading-indicator">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Загружается...</span>
                </div>
                <div class="loading-text">Загружается...</div>
            </div>
        `;
        
        // Insert before the main placeholder (always keep it first)
        const mainPlaceholder = photoGrid.querySelector('.photo-placeholder:not(.has-photo)');
        if (mainPlaceholder) {
            photoGrid.insertBefore(photoElement, mainPlaceholder.nextSibling);
        } else {
            photoGrid.appendChild(photoElement);
        }
        
        return photoElement;
    }

    // Make removePhoto function global
    window.removePhoto = function(button) {
        const photoElement = button.closest('.photo-placeholder');
        // Only remove if it has a photo and is not the main placeholder
        if (photoElement.classList.contains('has-photo')) {
            photoElement.remove();
        }
    };

    function uploadFiles(files) {
        if (uploadResults) {
            uploadResults.innerHTML = '';
        }

        let uploadedCount = 0;
        const totalFiles = files.length;

        Array.from(files).forEach(file => {
            uploadFile(file, (result) => {
                uploadedCount++;
                // Убираем показ uploadProgress - используем только лоадер на фото
            });
        });
    }

    function uploadFile(file, callback) {
        let loadingElement = null;
        
        // Show loading indicator
        if (currentPhotoSection) {
            loadingElement = addLoadingPhotoToSection(currentPhotoSection, file.name);
        }
        
        const formData = new FormData();
        formData.append('file', file);

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            // Remove loading indicator
            if (loadingElement) {
                loadingElement.remove();
            }
            
            if (data.success && currentPhotoSection) {
                console.log('Upload successful, adding photo to section:', currentPhotoSection);
                // Create temporary image URL from file
                const reader = new FileReader();
                reader.onload = function(e) {
                    addPhotoToSection(currentPhotoSection, e.target.result, data.photo.original_filename);
                };
                reader.readAsDataURL(file);
            } else {
                console.log('Upload successful but no current section or upload failed:', { success: data.success, currentSection: currentPhotoSection });
            }
            // Remove toast notifications
            callback(data);
        })
        .catch(error => {
            console.error('Upload error:', error);
            
            // Remove loading indicator
            if (loadingElement) {
                loadingElement.remove();
            }
            
            const errorResult = {
                success: false,
                error: 'Ошибка сети при загрузке файла'
            };
            // Only show errors, not success messages
            if (!errorResult.success) {
                showUploadResult(errorResult, file.name);
            }
            callback(errorResult);
        });
    }

    function showUploadResult(result, filename) {
        if (!uploadResults) {
            console.warn('Upload results container not found');
            return;
        }
        
        const alertClass = result.success ? 'alert-success' : 'alert-danger';
        const icon = result.success ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
        const message = result.success ? result.message : result.error;

        const resultElement = document.createElement('div');
        resultElement.className = `alert ${alertClass} alert-dismissible fade show`;
        resultElement.innerHTML = `
            <i class="${icon} me-2"></i>
            <strong>${filename}:</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        uploadResults.appendChild(resultElement);

        // Auto-hide success messages after 5 seconds
        if (result.success) {
            setTimeout(() => {
                if (resultElement.parentNode) {
                    resultElement.remove();
                }
            }, 5000);
        }
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // Camera functions
    async function openCamera() {
        try {
            // Reset UI state
            cameraError.style.display = 'none';
            cameraVideo.style.display = 'none';
            cameraCanvas.style.display = 'none';
            takePhotoBtn.style.display = 'none';
            uploadPhotosBtn.style.display = 'none';
            
            // Reset photo data
            capturedPhotos = [];
            updatePhotoCounter();
            
            cameraModal.show();
            
            // Check if getUserMedia is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera API not supported in this browser');
            }
            
            // Request camera access with fallback options
            const constraints = {
                video: {
                    facingMode: { ideal: 'environment' }, // Prefer back camera but allow fallback
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            };
            
            try {
                currentStream = await navigator.mediaDevices.getUserMedia(constraints);
            } catch (backCameraError) {
                // Fallback to any available camera
                console.warn('Back camera not available, trying front camera');
                const fallbackConstraints = {
                    video: {
                        facingMode: 'user',
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    },
                    audio: false
                };
                currentStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
            }
            
            cameraVideo.srcObject = currentStream;
            
            // Wait for video to be ready before showing it
            cameraVideo.onloadedmetadata = function() {
                cameraVideo.style.display = 'block';
                takePhotoBtn.style.display = 'block';
            };
            
        } catch (error) {
            console.error('Camera access error:', error);
            let errorMessage = 'Не удалось получить доступ к камере. ';
            
            if (error.name === 'NotAllowedError') {
                errorMessage += 'Разрешите доступ к камере в настройках браузера.';
            } else if (error.name === 'NotFoundError') {
                errorMessage += 'Камера не найдена на устройстве.';
            } else if (error.name === 'NotSupportedError') {
                errorMessage += 'Камера не поддерживается в этом браузере.';
            } else {
                errorMessage += 'Проверьте подключение камеры и настройки браузера.';
            }
            
            cameraError.innerHTML = `<i class="fas fa-exclamation-triangle me-2"></i>${errorMessage}`;
            cameraError.style.display = 'block';
        }
    }

    function capturePhoto() {
        console.log('capturePhoto called');
        const canvas = cameraCanvas;
        const video = cameraVideo;
        
        if (!video || !canvas) {
            console.error('Video or canvas element not found');
            return;
        }
        
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            console.error('Video not ready yet');
            return;
        }
        
        const context = canvas.getContext('2d');
        
        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Show captured photo and approval buttons
        video.style.display = 'none';
        canvas.style.display = 'block';
        takePhotoBtn.style.display = 'none';
        
        // Show approval buttons
        showPhotoApproval(canvas);
    }
    
    function showPhotoApproval(canvas) {
        // Hide shutter button and upload button
        takePhotoBtn.style.display = 'none';
        uploadPhotosBtn.style.display = 'none';
        
        // Remove existing approval buttons if any
        const existingApproval = document.getElementById('photo-approval');
        if (existingApproval) {
            existingApproval.remove();
        }
        
        // Create approval buttons
        const approvalDiv = document.createElement('div');
        approvalDiv.id = 'photo-approval';
        approvalDiv.className = 'photo-approval-controls';

        const rejectBtn = document.createElement('button');
        rejectBtn.className = 'photo-approval-btn reject';
        rejectBtn.innerHTML = '<i class="fas fa-times"></i>';
        rejectBtn.title = 'Отклонить фото';
        rejectBtn.onclick = () => rejectPhoto();

        const acceptBtn = document.createElement('button');
        acceptBtn.className = 'photo-approval-btn accept';
        acceptBtn.innerHTML = '<i class="fas fa-check"></i>';
        acceptBtn.title = 'Принять фото';
        acceptBtn.onclick = () => acceptPhoto(canvas);

        approvalDiv.appendChild(rejectBtn);
        approvalDiv.appendChild(acceptBtn);
        
        // Insert approval buttons in camera container
        canvas.parentNode.appendChild(approvalDiv);
    }
    
    function acceptPhoto(canvas) {
        // Convert canvas to blob and store
        canvas.toBlob(function(blob) {
            // Новая логика: добавить base64 в photos и обновить grid
            const reader = new FileReader();
            reader.onload = function(ev) {
                photos.push(ev.target.result);
                renderPhotoGrid();
            };
            reader.readAsDataURL(blob);

            // Старая логика (для счетчика, если нужно)
            const photoData = {
                blob: blob,
                timestamp: Date.now(),
                section: currentPhotoSection,
                filename: `camera_photo_${Date.now()}.jpg`
            };
            capturedPhotos.push(photoData);
            updatePhotoCounter();

            // Reset camera for next photo
            resetCameraForNextPhoto();
        }, 'image/jpeg', 0.8);
    }
    
    function rejectPhoto() {
        // Reset camera for next photo
        resetCameraForNextPhoto();
    }
    
    function resetCameraForNextPhoto() {
        // Remove approval buttons
        const approvalDiv = document.getElementById('photo-approval');
        if (approvalDiv) {
            approvalDiv.remove();
        }
        
        // Show video again, hide canvas
        cameraVideo.style.display = 'block';
        cameraCanvas.style.display = 'none';
        takePhotoBtn.style.display = 'block';
        
        // Update photo counter and upload button visibility
        updatePhotoCounter();
    }
    
    function updatePhotoCounter() {
        if (photoCount) {
            photoCount.textContent = capturedPhotos.length;
        }
        
        // Show counter and upload button if photos exist
        if (capturedPhotos.length > 0) {
            if (photoCounter) photoCounter.style.display = 'block';
            uploadPhotosBtn.style.display = 'block';
        } else {
            if (photoCounter) photoCounter.style.display = 'none';
            uploadPhotosBtn.style.display = 'none';
        }
    }
    
    function showTempMessage(message, type) {
        const alertClass = type === 'success' ? 'alert-success' : 
                          type === 'warning' ? 'alert-warning' : 'alert-info';
        
        const tempAlert = document.createElement('div');
        tempAlert.className = `alert ${alertClass} position-fixed top-0 start-50 translate-middle-x mt-3`;
        tempAlert.style.zIndex = '9999';
        tempAlert.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : 'exclamation-triangle'} me-2"></i>
            ${message}
        `;
        
        document.body.appendChild(tempAlert);
        
        // Auto-remove after 2 seconds
        setTimeout(() => {
            if (tempAlert.parentNode) {
                tempAlert.remove();
            }
        }, 2000);
    }
    
    function uploadCapturedPhotos() {
        if (capturedPhotos.length === 0) {
            return;
        }
        
        uploadResults.innerHTML = '';
        
        let uploadedCount = 0;
        const totalPhotos = capturedPhotos.length;
        
        // Create File objects from captured photos
        capturedPhotos.forEach(photoData => {
            const file = new File([photoData.blob], photoData.filename, {
                type: 'image/jpeg'
            });
            
            uploadFile(file, (result) => {
                uploadedCount++;
            });
        });
        
        // Close camera modal
        cameraModal.hide();
        
        // Clear captured photos
        clearCapturedPhotos();
    }
    
    function clearCapturedPhotos() {
        capturedPhotos = [];
        updatePhotoCounter();
        uploadPhotosBtn.style.display = 'none';
    }
    
    function stopCamera() {
        if (currentStream) {
            currentStream.getTracks().forEach(track => {
                track.stop();
            });
            currentStream = null;
        }
        
        // Clean up approval buttons
        const approvalDiv = document.getElementById('photo-approval');
        if (approvalDiv) {
            approvalDiv.remove();
        }
        
        // Reset states
        capturedPhotos = [];
        cameraVideo.style.display = 'none';
        cameraCanvas.style.display = 'none';
        cameraError.style.display = 'none';
        takePhotoBtn.style.display = 'none';
        uploadPhotosBtn.style.display = 'none';
        photoCounter.style.display = 'none';
        updatePhotoCounter();
    }
});