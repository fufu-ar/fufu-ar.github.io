// 拍照相关功能
class CameraHandler {
    constructor() {
        this.isCapturing = false;
        this.capturedImageBlob = null;
        this.initElements();
        this.bindEvents();
    }

    initElements() {
        this.cameraBtn = document.getElementById('cameraBtn');
        this.cameraFlash = document.getElementById('cameraFlash');
        this.photoPreviewOverlay = document.getElementById('photoPreviewOverlay');
        this.previewImage = document.getElementById('previewImage');
        this.photoCloseBtn = document.getElementById('photoCloseBtn');
        this.previewContainer = document.getElementById('previewContainer');
        this.uiElements = document.querySelector('.ui-elements');
    }

    bindEvents() {
        this.cameraBtn.addEventListener('click', () => {
            if (!this.isCapturing) {
                this.captureScreen();
            }
        });

        this.photoCloseBtn.addEventListener('click', () => this.closePhotoPreview());
        
        this.photoPreviewOverlay.addEventListener('click', (e) => {
            if (e.target === this.photoPreviewOverlay) {
                this.closePhotoPreview();
            }
        });
    }

    async captureScreen() {
        if (this.isCapturing || !window.arHandler.isDetected) return;
        
        try {
            this.isCapturing = true;
            this.cameraBtn.classList.add('capturing');
            
            const video = document.querySelector('video');
            const sceneCanvas = window.scene.renderer.domElement;
            
            if (!video || !sceneCanvas) {
                throw new Error('无法获取必要元素');
            }
            
            // 闪光效果
            this.cameraFlash.classList.add('flash');
            setTimeout(() => this.cameraFlash.classList.remove('flash'), 100);
            
            this.uiElements.classList.add('hidden-for-capture');
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // 强制渲染
            window.scene.renderer.render(window.scene.object3D, window.scene.camera);
            await new Promise(resolve => requestAnimationFrame(resolve));
            
            // 创建高分辨率canvas
            const outputCanvas = document.createElement('canvas');
            const pixelRatio = Math.min(window.devicePixelRatio || 1, 3);
            const baseWidth = window.innerWidth;
            const baseHeight = window.innerHeight;
            
            outputCanvas.width = baseWidth * pixelRatio;
            outputCanvas.height = baseHeight * pixelRatio;
            
            const ctx = outputCanvas.getContext('2d');
            ctx.scale(pixelRatio, pixelRatio);
            
            // 绘制视频背景
            if (video.readyState >= 2) {
                const videoAspect = video.videoWidth / video.videoHeight;
                const canvasAspect = baseWidth / baseHeight;
                
                let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
                
                if (videoAspect > canvasAspect) {
                    drawHeight = baseHeight;
                    drawWidth = drawHeight * videoAspect;
                    offsetX = (baseWidth - drawWidth) / 2;
                } else {
                    drawWidth = baseWidth;
                    drawHeight = drawWidth / videoAspect;
                    offsetY = (baseHeight - drawHeight) / 2;
                }
                
                ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
            }
            
            // 叠加3D场景
            ctx.globalCompositeOperation = 'source-over';
            ctx.drawImage(sceneCanvas, 0, 0, baseWidth, baseHeight);
            
            // 恢复UI
            this.uiElements.classList.remove('hidden-for-capture');
            
            // 生成图片
            outputCanvas.toBlob((blob) => {
                if (blob) {
                    this.handleCaptureSuccess(blob);
                } else {
                    this.handleCaptureError('生成图片失败');
                }
                this.isCapturing = false;
                this.cameraBtn.classList.remove('capturing');
            }, 'image/jpeg', 0.9);
            
        } catch (error) {
            console.error('拍照失败:', error);
            this.uiElements.classList.remove('hidden-for-capture');
            this.isCapturing = false;
            this.cameraBtn.classList.remove('capturing');
            alert('拍照失败: ' + error.message);
        }
    }

    handleCaptureSuccess(blob) {
        this.capturedImageBlob = blob;
        const url = URL.createObjectURL(blob);
        
        // 启用系统保存功能
        this.previewImage.crossOrigin = 'anonymous';
        this.previewImage.style.webkitUserSelect = 'none';
        this.previewImage.style.webkitTouchCallout = 'default';
        this.previewImage.src = url;
        
        // 显示预览
        this.photoPreviewOverlay.classList.add('show');
        setTimeout(() => {
            this.previewContainer.classList.add('animate-in');
        }, 50);
    }

    handleCaptureError(message) {
        console.error('截图失败:', message);
        alert(`截图失败: ${message}\n请确保已正确识别3D模型后再尝试拍照`);
    }

    closePhotoPreview() {
        this.previewContainer.classList.remove('animate-in');
        setTimeout(() => {
            this.photoPreviewOverlay.classList.remove('show');
            if (this.capturedImageBlob) {
                URL.revokeObjectURL(this.previewImage.src);
                this.capturedImageBlob = null;
            }
        }, 300);
    }
}
