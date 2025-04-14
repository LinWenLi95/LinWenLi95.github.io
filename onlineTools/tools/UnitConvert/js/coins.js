let isDragging = false;
let offsetX, offsetY;
let draggedCoin;
let coins = [];
const collectionModule = document.getElementById('collectionModule');
const coinCountElement = document.getElementById('coinCount');
let coinCount = 0;
let isDraggingModule = false;
let startX, startY;
let isEffectEnabled = true;
const collectionBox = document.getElementById('collectionBox'); // 缓存收集箱元素

// 开关按钮点击事件处理程序
const toggleButton = document.getElementById('toggleButton');
toggleButton.addEventListener('click', function () {
    isEffectEnabled =!isEffectEnabled;
    if (isEffectEnabled) {
        collectionModule.classList.remove('transparent');
        toggleButton.textContent = '关闭特效';
    } else {
        collectionModule.classList.add('transparent');
        toggleButton.textContent = '打开特效';
    }
    // 批量移除金币
    const fragment = document.createDocumentFragment();
    coins.forEach(coin => {
        fragment.appendChild(coin);
    });
    coins.length = 0;
    document.body.removeChild(fragment);
});

document.addEventListener('mousedown', function (event) {
    if (!isEffectEnabled) return;

    if (event.target.classList.contains('coin')) {
        isDragging = true;
        draggedCoin = event.target;
        const rect = draggedCoin.getBoundingClientRect();
        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;
    } else if (event.target.closest('#collectionModule')) {
        isDraggingModule = true;
        startX = event.clientX;
        startY = event.clientY;
        offsetX = collectionModule.offsetLeft;
        offsetY = collectionModule.offsetTop;
    } else if (event.target.id!== 'collectButton') {
        const coinCount = Math.floor(Math.random() * 11) + 10;
        const gravity = 0.5 * 4;

        const fragment = document.createDocumentFragment();
        for (let i = 0; i < coinCount; i++) {
            const coin = document.createElement('div');
            coin.classList.add('coin');

            let startX = event.pageX - 15;
            let startY = event.pageY - 15;

            const initialSpeed = Math.random() * 10 + 20;
            const angle = (Math.random() * (Math.PI / 3) + (Math.PI / 2 - Math.PI / 6));

            let vx = initialSpeed * Math.cos(angle);
            let vy = initialSpeed * Math.sin(angle);

            coin.style.left = startX + 'px';
            coin.style.top = startY + 'px';

            fragment.appendChild(coin);
            coins.push(coin);

            let t = 0;
            let isOnGround = false;

            let rotationAngle = 0;
            const randomAxisX = Math.random();
            const randomAxisY = Math.random();
            const randomAxisZ = Math.random();
            const rotationIncrement = 5;

            const animate = () => {
                if (!isEffectEnabled ||!coin.parentNode) {
                    const index = coins.indexOf(coin);
                    if (index > -1) {
                        coins.splice(index, 1);
                    }
                    if (coin.parentNode) {
                        coin.parentNode.removeChild(coin);
                    }
                    return;
                }

                if (!isOnGround) {
                    t += 0.4;
                    let newX = startX + vx * t;
                    let newY = startY - (vy * t - 0.5 * gravity * t * t);

                    // 边界检测
                    if (newX <= 0 || newX >= window.innerWidth - 30) {
                        vx = -vx; // 反转水平速度
                        vy = 0; // 反转水平速度
                        startX = newX; // 更新水平方向的起始位置
                        startY = newY; // 更新垂直方向的起始位置
                        t = 0; // 重置时间
                    }

                    if (newY >= window.innerHeight - 36) {
                        // 检查下方是否有金币
                        let foundBelow = false;
                        coins.forEach(otherCoin => {
                            if (otherCoin!== coin) {
                                const otherRect = otherCoin.getBoundingClientRect();
                                const coinRect = coin.getBoundingClientRect();
                                if (Math.abs(coinRect.left - otherRect.left) < 30 && otherRect.top > coinRect.top) {
                                    newY = otherRect.top - 15; // 嵌入一半
                                    foundBelow = true;
                                }
                            }
                        });
                        if (!foundBelow) {
                            newY = window.innerHeight - 36;
                        }
                        isOnGround = true;
                    }

                    coin.style.left = newX + 'px';
                    coin.style.top = newY + 'px';
                }

                if (!isOnGround) {
                    rotationAngle += rotationIncrement;
                    coin.style.transform = `translate3d(0, 0, 0) rotate3d(${randomAxisX}, ${randomAxisY}, ${randomAxisZ}, ${rotationAngle}deg)`;
                    requestAnimationFrame(animate);
                }
            };

            requestAnimationFrame(animate);
        }
        document.body.appendChild(fragment);
    }
});

document.addEventListener('mousemove', function (event) {
    if (!isEffectEnabled) return;

    if (isDragging) {
        draggedCoin.style.left = (event.clientX - offsetX) + 'px';
        draggedCoin.style.top = (event.clientY - offsetY) + 'px';
    } else if (isDraggingModule) {
        const dx = event.clientX - startX;
        const dy = event.clientY - startY;
        // 只修改位置，不改变宽度
        collectionModule.style.left = (offsetX + dx) + 'px';
        collectionModule.style.top = (offsetY + dy) + 'px';
    }
});

document.addEventListener('mouseup', function (event) {
    if (!isEffectEnabled) return;

    if (isDragging) {
        isDragging = false;
        const boxRect = collectionBox.getBoundingClientRect();
        const coinRect = draggedCoin.getBoundingClientRect();

        if (
            coinRect.left >= boxRect.left &&
            coinRect.right <= boxRect.right &&
            coinRect.top >= boxRect.top &&
            coinRect.bottom <= boxRect.bottom
        ) {
            // 金币在收集箱内，收集金币
            const index = coins.indexOf(draggedCoin);
            if (index > -1) {
                coins.splice(index, 1);
            }
            draggedCoin.parentNode.removeChild(draggedCoin);
            coinCount++;
            coinCountElement.textContent = coinCount;
        } else {
            // 金币不在收集箱内，让金币下落
            const gravity = 0.5 * 4;
            const startX = parseFloat(draggedCoin.style.left);
            const startY = parseFloat(draggedCoin.style.top);
            let t = 0;
            let isOnGround = false;

            let rotationAngle = 0;
            const randomAxisX = Math.random();
            const randomAxisY = Math.random();
            const randomAxisZ = Math.random();
            const rotationIncrement = 5;

            const animateFall = () => {
                if (!isEffectEnabled ||!draggedCoin.parentNode) {
                    const index = coins.indexOf(draggedCoin);
                    if (index > -1) {
                        coins.splice(index, 1);
                    }
                    if (draggedCoin.parentNode) {
                        draggedCoin.parentNode.removeChild(draggedCoin);
                    }
                    draggedCoin = null;
                    return;
                }

                if (!isOnGround) {
                    t += 0.4; // 与爆金币下落的时间步长保持一致
                    let newX = startX; // 初速度为 0，水平位置不变
                    let newY = startY + 0.5 * gravity * t * t;

                    if (newY >= window.innerHeight - 36) {
                        // 检查下方是否有金币
                        let foundBelow = false;
                        coins.forEach(otherCoin => {
                            if (otherCoin!== draggedCoin) {
                                const otherRect = otherCoin.getBoundingClientRect();
                                const coinRect = draggedCoin.getBoundingClientRect();
                                if (Math.abs(coinRect.left - otherRect.left) < 30 && otherRect.top > coinRect.top) {
                                    newY = otherRect.top - 15; // 嵌入一半
                                    foundBelow = true;
                                }
                            }
                        });
                        if (!foundBelow) {
                            newY = window.innerHeight - 36;
                        }
                        isOnGround = true;
                    }

                    draggedCoin.style.left = newX + 'px';
                    draggedCoin.style.top = newY + 'px';
                }

                if (!isOnGround) {
                    rotationAngle += rotationIncrement;
                    draggedCoin.style.transform = `translate3d(0, 0, 0) rotate3d(${randomAxisX}, ${randomAxisY}, ${randomAxisZ}, ${rotationAngle}deg)`;
                    requestAnimationFrame(animateFall);
                } else {
                    // 金币落地后将 draggedCoin 置为 null
                    draggedCoin = null;
                }
            };

            requestAnimationFrame(animateFall);
        }
    } else if (isDraggingModule) {
        isDraggingModule = false;
    }
});

document.getElementById('collectButton').addEventListener('click', function () {
    if (!isEffectEnabled) return;

    const interval = 20; // 设置每个金币动画的间隔时间，单位为毫秒
    // 每次点击收集按钮时，获取收集箱的最新位置
    const boxRect = collectionBox.getBoundingClientRect();
    // 调用函数打乱coins顺序
    coins = shuffleArray(coins);
    // 遍历所有金币，为每个金币创建飞向收集箱的动画
    coins.forEach((coin, index) => {
        // 计算金币飞向收集箱的目标位置
        const targetX = boxRect.left + (boxRect.width - coin.offsetWidth) / 2;
        const targetY = boxRect.top + (boxRect.height - coin.offsetHeight) / 2;

        // 获取金币的起始位置
        const startX = parseFloat(coin.style.left);
        const startY = parseFloat(coin.style.top);

        // 初始化时间变量，用于控制动画进度
        let t = 0;
        // 动画持续时间（秒）
        const duration = 2;
        // 每秒的帧数
        const frames = 60;
        // 每帧的时间步长
        const step = 1 / (duration * frames);

        // 初始化旋转角度
        let rotationAngle = 0;
        // 旋转速度
        const rotationSpeed = 10;

        // 随机生成旋转轴
        const randomAxisX = Math.random();
        const randomAxisY = Math.random();
        const randomAxisZ = Math.random();

        // 定义动画函数，用于更新金币的位置和旋转角度
        const animateFly = () => {
            // 检查特效是否关闭或者金币是否已从 DOM 中移除
            if (!isEffectEnabled ||!coin.parentNode) {
                // 从 coins 数组中移除该金币
                const index = coins.indexOf(coin);
                if (index > -1) {
                    coins.splice(index, 1);
                }
                // 从文档中删除该金币元素
                if (coin.parentNode) {
                    coin.parentNode.removeChild(coin);
                }
                return;
            }

            // 检查动画是否未完成
            if (t < 1) {
                // 增加时间步长
                t += step;
                // 计算当前帧的新位置
                const newX = startX + (targetX - startX) * t;
                const newY = startY + (targetY - startY) * t;

                // 更新金币的位置
                coin.style.left = newX + 'px';
                coin.style.top = newY + 'px';

                // 增加旋转角度
                rotationAngle += rotationSpeed;
                // 更新金币的旋转样式
                coin.style.transform = `translate3d(0, 0, 0) rotate3d(${randomAxisX}, ${randomAxisY}, ${randomAxisZ}, ${rotationAngle}deg)`;

                // 请求下一帧动画
                requestAnimationFrame(animateFly);
            } else {
                // 动画完成，将金币移动到目标位置
                coin.style.left = targetX + 'px';
                coin.style.top = targetY + 'px';
                // 增加金币总数
                coinCount++;
                // 更新界面上显示的金币数量
                coinCountElement.textContent = coinCount;
                // 从 coins 数组中移除该金币
                const index = coins.indexOf(coin);
                if (index > -1) {
                    coins.splice(index, 1);
                }
                // 从文档中删除该金币元素
                if (coin.parentNode) {
                    coin.parentNode.removeChild(coin);
                }
            }
        };

        // 延迟一段时间后开始动画，实现金币逐个飞向收集箱的效果
        setTimeout(() => {
            requestAnimationFrame(animateFly);
        }, index * interval);
    });
});

// Fisher-Yates 洗牌算法
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}