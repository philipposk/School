// Resizable split panels for assignments/modules
// Allows dragging divider to resize panels, changing layout orientation, closing panels

const ResizablePanels = {
    panels: new Map(),
    
    createSplitView(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return null;
        
        const {
            leftContent = '',
            rightContent = '',
            initialSplit = 50, // percentage
            orientation = 'vertical', // 'vertical' or 'horizontal'
            minSize = 20, // minimum percentage
            maxSize = 80, // maximum percentage
            resizable = true,
            onResize = null
        } = options;
        
        const panelId = `split-panel-${Date.now()}`;
        const split = initialSplit;
        
        const panelHTML = `
            <div class="resizable-split-container" data-orientation="${orientation}" id="${panelId}">
                <div class="resizable-panel resizable-panel-left" style="${orientation === 'vertical' ? `width: ${split}%` : `height: ${split}%`}">
                    <div class="panel-header">
                        <span class="panel-title">Module</span>
                        <div class="panel-controls">
                            <button class="panel-btn" onclick="ResizablePanels.toggleLayout('${panelId}')" title="Switch Layout">
                                <span class="layout-icon">⇄</span>
                            </button>
                            <button class="panel-btn" onclick="ResizablePanels.closePanel('${panelId}', 'left')" title="Close Panel">
                                ✕
                            </button>
                        </div>
                    </div>
                    <div class="panel-content">
                        ${leftContent}
                    </div>
                </div>
                ${resizable ? `
                    <div class="resizable-divider" 
                         data-panel-id="${panelId}"
                         onmousedown="ResizablePanels.startResize(event, '${panelId}')"
                         ontouchstart="ResizablePanels.startResize(event, '${panelId}')">
                        <div class="divider-handle"></div>
                    </div>
                ` : ''}
                <div class="resizable-panel resizable-panel-right" style="${orientation === 'vertical' ? `width: ${100 - split}%` : `height: ${100 - split}%`}">
                    <div class="panel-header">
                        <span class="panel-title">Chat</span>
                        <div class="panel-controls">
                            <button class="panel-btn" onclick="ResizablePanels.toggleLayout('${panelId}')" title="Switch Layout">
                                <span class="layout-icon">⇄</span>
                            </button>
                            <button class="panel-btn" onclick="ResizablePanels.closePanel('${panelId}', 'right')" title="Close Panel">
                                ✕
                            </button>
                        </div>
                    </div>
                    <div class="panel-content">
                        ${rightContent}
                    </div>
                </div>
                ${resizable ? `
                    <div class="resize-indicator" id="${panelId}-indicator" style="display: none;">
                        <div class="resize-arrow-left">←</div>
                        <div class="resize-arrow-right">→</div>
                    </div>
                ` : ''}
            </div>
        `;
        
        container.innerHTML = panelHTML;
        
        const panelData = {
            id: panelId,
            container,
            orientation,
            split,
            minSize,
            maxSize,
            resizable,
            onResize,
            isResizing: false
        };
        
        this.panels.set(panelId, panelData);
        
        // Inject styles if not already present
        this.injectStyles();
        
        return panelId;
    },
    
    startResize(e, panelId) {
        e.preventDefault();
        const panel = this.panels.get(panelId);
        if (!panel || !panel.resizable) return;
        
        panel.isResizing = true;
        const isTouch = e.type === 'touchstart';
        const startEvent = isTouch ? e.touches[0] : e;
        
        const container = document.getElementById(panelId);
        const leftPanel = container.querySelector('.resizable-panel-left');
        const rightPanel = container.querySelector('.resizable-panel-right');
        const indicator = document.getElementById(`${panelId}-indicator`);
        
        const isVertical = panel.orientation === 'vertical';
        const containerSize = isVertical ? container.offsetWidth : container.offsetHeight;
        const startPos = isVertical ? startEvent.clientX : startEvent.clientY;
        const leftSize = isVertical ? leftPanel.offsetWidth : leftPanel.offsetHeight;
        
        indicator.style.display = 'flex';
        
        const doResize = (moveEvent) => {
            if (!panel.isResizing) return;
            
            const currentEvent = isTouch ? moveEvent.touches[0] : moveEvent;
            const currentPos = isVertical ? currentEvent.clientX : currentEvent.clientY;
            const diff = currentPos - startPos;
            const newSize = ((leftSize + diff) / containerSize) * 100;
            
            const clampedSize = Math.max(panel.minSize, Math.min(panel.maxSize, newSize));
            panel.split = clampedSize;
            
            if (isVertical) {
                leftPanel.style.width = `${clampedSize}%`;
                rightPanel.style.width = `${100 - clampedSize}%`;
            } else {
                leftPanel.style.height = `${clampedSize}%`;
                rightPanel.style.height = `${100 - clampedSize}%`;
            }
            
            if (panel.onResize) {
                panel.onResize(clampedSize);
            }
        };
        
        const stopResize = () => {
            panel.isResizing = false;
            indicator.style.display = 'none';
            document.removeEventListener(isTouch ? 'touchmove' : 'mousemove', doResize);
            document.removeEventListener(isTouch ? 'touchend' : 'mouseup', stopResize);
        };
        
        document.addEventListener(isTouch ? 'touchmove' : 'mousemove', doResize);
        document.addEventListener(isTouch ? 'touchend' : 'mouseup', stopResize);
    },
    
    toggleLayout(panelId) {
        const panel = this.panels.get(panelId);
        if (!panel) return;
        
        const container = document.getElementById(panelId);
        const newOrientation = panel.orientation === 'vertical' ? 'horizontal' : 'vertical';
        
        container.setAttribute('data-orientation', newOrientation);
        panel.orientation = newOrientation;
        
        // Swap dimensions
        const leftPanel = container.querySelector('.resizable-panel-left');
        const rightPanel = container.querySelector('.resizable-panel-right');
        const split = panel.split;
        
        if (newOrientation === 'vertical') {
            leftPanel.style.width = `${split}%`;
            leftPanel.style.height = '';
            rightPanel.style.width = `${100 - split}%`;
            rightPanel.style.height = '';
        } else {
            leftPanel.style.height = `${split}%`;
            leftPanel.style.width = '';
            rightPanel.style.height = `${100 - split}%`;
            rightPanel.style.width = '';
        }
    },
    
    closePanel(panelId, side) {
        const panel = this.panels.get(panelId);
        if (!panel) return;
        
        const container = document.getElementById(panelId);
        const leftPanel = container.querySelector('.resizable-panel-left');
        const rightPanel = container.querySelector('.resizable-panel-right');
        const divider = container.querySelector('.resizable-divider');
        
        if (side === 'left') {
            leftPanel.style.display = 'none';
            if (divider) divider.style.display = 'none';
            rightPanel.style.width = '100%';
            rightPanel.style.height = '100%';
        } else {
            rightPanel.style.display = 'none';
            if (divider) divider.style.display = 'none';
            leftPanel.style.width = '100%';
            leftPanel.style.height = '100%';
        }
        
        // Show restore button
        const restoreBtn = document.createElement('button');
        restoreBtn.className = 'restore-panel-btn';
        restoreBtn.innerHTML = side === 'left' ? '←' : '→';
        restoreBtn.onclick = () => {
            leftPanel.style.display = '';
            rightPanel.style.display = '';
            if (divider) divider.style.display = '';
            restoreBtn.remove();
            this.restoreSplit(panelId);
        };
        container.appendChild(restoreBtn);
    },
    
    restoreSplit(panelId) {
        const panel = this.panels.get(panelId);
        if (!panel) return;
        
        const container = document.getElementById(panelId);
        const leftPanel = container.querySelector('.resizable-panel-left');
        const rightPanel = container.querySelector('.resizable-panel-right');
        const isVertical = panel.orientation === 'vertical';
        const split = panel.split;
        
        if (isVertical) {
            leftPanel.style.width = `${split}%`;
            rightPanel.style.width = `${100 - split}%`;
        } else {
            leftPanel.style.height = `${split}%`;
            rightPanel.style.height = `${100 - split}%`;
        }
    },
    
    injectStyles() {
        if (document.getElementById('resizable-panels-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'resizable-panels-styles';
        style.textContent = `
            .resizable-split-container {
                display: flex;
                width: 100%;
                height: 100%;
                position: relative;
                overflow: hidden;
            }
            
            .resizable-split-container[data-orientation="vertical"] {
                flex-direction: row;
            }
            
            .resizable-split-container[data-orientation="horizontal"] {
                flex-direction: column;
            }
            
            .resizable-panel {
                overflow: hidden;
                display: flex;
                flex-direction: column;
                transition: width 0.2s ease, height 0.2s ease;
            }
            
            .panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.75rem 1rem;
                background: var(--hover-bg);
                border-bottom: 1px solid var(--border);
            }
            
            .panel-title {
                font-weight: 600;
                color: var(--text);
            }
            
            .panel-controls {
                display: flex;
                gap: 0.5rem;
            }
            
            .panel-btn {
                background: transparent;
                border: none;
                cursor: pointer;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                color: var(--text);
                transition: background 0.2s;
            }
            
            .panel-btn:hover {
                background: var(--border);
            }
            
            .panel-content {
                flex: 1;
                overflow-y: auto;
                padding: 1rem;
            }
            
            .resizable-divider {
                background: var(--border);
                cursor: ${this.panels.values().next().value?.orientation === 'vertical' ? 'col-resize' : 'row-resize'};
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                min-width: 8px;
                min-height: 8px;
                transition: background 0.2s;
            }
            
            .resizable-divider:hover {
                background: var(--theme-primary);
            }
            
            .divider-handle {
                width: 4px;
                height: 40px;
                background: var(--text-light);
                border-radius: 2px;
                opacity: 0.5;
            }
            
            .resizable-split-container[data-orientation="horizontal"] .divider-handle {
                width: 40px;
                height: 4px;
            }
            
            .resize-indicator {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                display: flex;
                gap: 1rem;
                align-items: center;
                pointer-events: none;
                z-index: 1000;
            }
            
            .resize-arrow-left,
            .resize-arrow-right {
                font-size: 2rem;
                color: var(--theme-primary);
                opacity: 0.7;
            }
            
            .restore-panel-btn {
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: var(--theme-primary);
                color: white;
                border: none;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 1.5rem;
                z-index: 1000;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }
            
            .restore-panel-btn:hover {
                transform: scale(1.1);
            }
        `;
        document.head.appendChild(style);
    }
};

// Make globally available
window.ResizablePanels = ResizablePanels;

