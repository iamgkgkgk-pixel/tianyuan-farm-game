// ===== 钓鱼小游戏系统 =====

// 钓鱼状态机
const FISHING_STATE = {
    IDLE: 'idle',
    CASTING: 'casting',
    WAITING: 'waiting',
    BITING: 'biting',
    QTE: 'qte',
    RESULT: 'result'
};

// QTE难度配置
const QTE_CONFIG = {
    common: { speed: 0.6, zoneWidth: 0.30, times: 1 },
    rare: { speed: 1.0, zoneWidth: 0.20, times: 2 },
    legendary: { speed: 1.6, zoneWidth: 0.10, times: 3 }
};

// 钓鱼奖励配置
const FISHING_REWARDS = {
    common: { gold: [10, 30], xp: [5, 15], fragmentType: null },
    rare: { gold: [50, 150], xp: [20, 50], fragmentType: 'rare_fragment', fragmentChance: 0.3 },
    legendary: { gold: [300, 800], xp: [100, 300], fragmentType: 'legend_fragment', fragmentChance: 1.0 }
};

// 钓鱼系统
const FishingSystem = {
    state: FISHING_STATE.IDLE,
    currentFish: null,
    qteRound: 0,
    qteSuccess: 0,
    qteAngle: 0,       // 当前指针角度 (0-360)
    qteZoneStart: 0,   // 成功区间起始角度
    qteZoneEnd: 0,     // 成功区间结束角度
    qteDirection: 1,   // 旋转方向
    waitTimer: null,
    animFrame: null,
    waitAnimFrame: null,   // 等待动画帧
    biteAnimFrame: null,   // 和钓动画帧
    totalFishToday: 0,
    consecutiveDays: 0,
    newbieCatch: 0,    // 新手保底计数


    // 开始钓鱼
    startFishing() {
        if (this.state !== FISHING_STATE.IDLE) return;

        this.state = FISHING_STATE.CASTING;
        this.updateFishingStatus('🎣 抛竿中...', '#4CAF50');

        // 抛竿动画（保存timer引用，确保可以取消）
        this.waitTimer = setTimeout(() => {
            if (this.state !== FISHING_STATE.CASTING) return;
            this.state = FISHING_STATE.WAITING;
            const waitTime = 3000 + Math.random() * 7000; // 3-10秒
            this.updateFishingStatus('🪝 等待鱼儿上钩...', '#aaa');
            this.startWaitAnimation();

            this.waitTimer = setTimeout(() => {
                this.onFishBite();
            }, waitTime);
        }, 800);
    },


    // 鱼咬钩
    onFishBite() {
        if (this.state !== FISHING_STATE.WAITING) return;

        // 确定鱼种
        this.currentFish = this.determineFish();
        this.state = FISHING_STATE.BITING;

        // 视觉+震动提示
        this.updateFishingStatus('⚡ 鱼咬钩了！快点击！', '#FFD700');
        this.playBiteEffect();

        // 反应窗口 1-2秒
        const reactionWindow = 1000 + Math.random() * 1000;
        this.waitTimer = setTimeout(() => {
            if (this.state === FISHING_STATE.BITING) {
                // 超时，鱼逃脱
                this.onFishEscape();
            }
        }, reactionWindow);
    },

    // 玩家点击响应（咬钩阶段）
    onPlayerClick() {
        if (this.state === FISHING_STATE.BITING) {
            clearTimeout(this.waitTimer);
            // 取消咬钩动画
            if (this.biteAnimFrame) {
                cancelAnimationFrame(this.biteAnimFrame);
                this.biteAnimFrame = null;
            }
            this.startQTE();
        } else if (this.state === FISHING_STATE.IDLE) {
            this.startFishing();
        }
    },


    // 开始QTE
    startQTE() {
        this.state = FISHING_STATE.QTE;
        const fish = this.currentFish;
        const config = QTE_CONFIG[fish.rarity];

        this.qteRound = 0;
        this.qteSuccess = 0;
        this.qteAngle = 0;
        this.qteDirection = 1;

        // 随机成功区间
        const zoneSize = config.zoneWidth * 360;
        this.qteZoneStart = Math.random() * (360 - zoneSize);
        this.qteZoneEnd = this.qteZoneStart + zoneSize;

        this.updateFishingStatus(`🎯 QTE！点击绿色区域！(${this.qteRound + 1}/${config.times})`, '#4CAF50');
        this.renderQTE();
        this.startQTEAnimation();
    },

    // QTE动画循环
    startQTEAnimation() {
        const fish = this.currentFish;
        const config = QTE_CONFIG[fish.rarity];
        let lastTime = performance.now();

        const animate = (now) => {
            if (this.state !== FISHING_STATE.QTE) return;

            const dt = (now - lastTime) / 1000;
            lastTime = now;

            // 指针旋转
            this.qteAngle += config.speed * 360 * dt * this.qteDirection;
            if (this.qteAngle >= 360) { this.qteAngle -= 360; this.qteDirection = -1; }
            if (this.qteAngle <= 0) { this.qteAngle += 360; this.qteDirection = 1; }

            this.renderQTE();
            this.animFrame = requestAnimationFrame(animate);
        };

        this.animFrame = requestAnimationFrame(animate);
    },

    // 渲染QTE圆环
    renderQTE() {
        const canvas = document.getElementById('qte-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const cx = canvas.width / 2, cy = canvas.height / 2;
        const r = 80;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 背景圆环
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 16;
        ctx.stroke();

        // 成功区间（绿色）
        const startRad = (this.qteZoneStart - 90) * Math.PI / 180;
        const endRad = (this.qteZoneEnd - 90) * Math.PI / 180;
        ctx.beginPath();
        ctx.arc(cx, cy, r, startRad, endRad);
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 16;
        ctx.stroke();

        // 指针
        const pRad = (this.qteAngle - 90) * Math.PI / 180;
        const px = cx + r * Math.cos(pRad);
        const py = cy + r * Math.sin(pRad);
        ctx.beginPath();
        ctx.arc(px, py, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#FFD700';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 鱼图标
        if (this.currentFish) {
            ctx.font = '28px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('❓', cx, cy);
        }
    },

    // 玩家点击QTE
    onQTEClick() {
        if (this.state !== FISHING_STATE.QTE) return;

        const fish = this.currentFish;
        const config = QTE_CONFIG[fish.rarity];

        // 判断是否在成功区间
        const inZone = this.qteAngle >= this.qteZoneStart && this.qteAngle <= this.qteZoneEnd;

        if (inZone) {
            this.qteSuccess++;
            this.qteRound++;

            if (this.qteRound >= config.times) {
                // 全部成功
                cancelAnimationFrame(this.animFrame);
                this.onCatchSuccess();
            } else {
                // 下一轮QTE
                const zoneSize = config.zoneWidth * 360;
                this.qteZoneStart = Math.random() * (360 - zoneSize);
                this.qteZoneEnd = this.qteZoneStart + zoneSize;
                this.updateFishingStatus(`🎯 继续！(${this.qteRound + 1}/${config.times})`, '#4CAF50');
                // 闪烁成功提示
                this.flashQTESuccess();
            }
        } else {
            // 失败
            cancelAnimationFrame(this.animFrame);
            this.onFishEscape();
        }
    },

    // 钓鱼成功
    onCatchSuccess() {
        this.state = FISHING_STATE.RESULT;
        const fish = this.currentFish;

        // 新手保底
        this.newbieCatch++;

        // 播放钓获动画
        this.playCatchAnimation(fish);

        // 发放奖励
        const rewards = FISHING_REWARDS[fish.rarity];
        const gold = Math.floor(rewards.gold[0] + Math.random() * (rewards.gold[1] - rewards.gold[0]));
        const xp = Math.floor(rewards.xp[0] + Math.random() * (rewards.xp[1] - rewards.xp[0]));

        GameState.addGold(gold);
        GameState.addXP(xp);

        // 碎片奖励
        if (rewards.fragmentType && Math.random() < rewards.fragmentChance) {
            if (!GameState.inventory.tools[rewards.fragmentType]) GameState.inventory.tools[rewards.fragmentType] = 0;
            GameState.inventory.tools[rewards.fragmentType]++;
            showNotification(`🧩 获得 ${fish.rarity === 'legendary' ? '传说' : '稀有'}种子袋碎片！`, 'gold');
            // 检查合成
            this.checkFragmentCraft();
        }

        // 统计
        this.totalFishToday++;
        if (!GameState.player.totalFishCaught) GameState.player.totalFishCaught = 0;
        GameState.player.totalFishCaught++;

        // 录入图鉴
        Pokedex.unlock('fish', fish.id, { rarity: fish.rarity, firstTime: Date.now() });

        showNotification(`🎣 钓到了 ${fish.name}！获得 ${gold}金币 +${xp}XP`, 'gold');

        // 传说鱼特殊提示 + 扭蛋代币联动
        if (fish.rarity === 'legendary') {
            showNotification(`🐉 传说鱼！全服捕获率极低！`, 'gold');
            if (typeof GachaSystem !== 'undefined') {
                GachaSystem.onLegendaryFishCaught(fish.id);
            }
        }


        GameState.save();

        setTimeout(() => {
            this.resetFishing();
        }, 2500);
    },

    // 鱼逃脱
    onFishEscape() {
        this.state = FISHING_STATE.RESULT;
        this.updateFishingStatus('💨 鱼逃跑了...', '#f44336');

        // 新手保底：前3次必钓到（newbieCatch记录尝试次数，不依赖成功）
        if (this.newbieCatch < 3) {
            this.newbieCatch++; // 逃脱也计入次数，避免无限循环
            setTimeout(() => {
                if (this.state !== FISHING_STATE.RESULT) return;
                this.state = FISHING_STATE.WAITING;
                this.updateFishingStatus('🪝 再试一次...', '#aaa');
                this.startWaitAnimation();
                this.waitTimer = setTimeout(() => this.onFishBite(), 1500);
            }, 1000);
            return;
        }


        const canvas = document.getElementById('qte-canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = '48px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('💨', canvas.width / 2, canvas.height / 2);
        }

        setTimeout(() => this.resetFishing(), 1500);
    },

    // 确定鱼种（根据季节/天气/时间）
    determineFish() {
        const season = GameState.gameTime.season;
        const weather = GameState.gameTime.weather;
        // 使用游戏内时间而非真实时间
        const hour = GameState.gameTime.hour;
        const timeOfDay = hour >= 5 && hour < 9 ? 'morning' :
                          hour >= 9 && hour < 17 ? 'day' :
                          hour >= 17 && hour < 20 ? 'evening' :
                          hour >= 20 || hour < 5 ? 'night' : 'day';


        // 新手保底：前3次必钓到
        if (this.newbieCatch < 3) {
            const commonFish = Object.values(FISH_DATA).filter(f => f.rarity === 'common');
            return commonFish[Math.floor(Math.random() * commonFish.length)];
        }

        // 筛选符合条件的鱼
        const eligible = Object.values(FISH_DATA).filter(fish => {
            const seasonOk = fish.season === 'all' || fish.season === season ||
                             (Array.isArray(fish.season) && fish.season.includes(season));
            const weatherOk = fish.weather === 'all' || fish.weather === weather;
            const timeOk = fish.time === 'all' || fish.time === timeOfDay;
            return seasonOk && weatherOk && timeOk;
        });

        if (eligible.length === 0) {
            // 兜底：返回鲫鱼
            return FISH_DATA.crucian;
        }

        // 加权随机
        const totalWeight = eligible.reduce((sum, f) => sum + f.prob, 0);
        let rand = Math.random() * totalWeight;
        for (const fish of eligible) {
            rand -= fish.prob;
            if (rand <= 0) return fish;
        }
        return eligible[eligible.length - 1];
    },

    // 检查碎片合成
    checkFragmentCraft() {
        const rareFrags = GameState.inventory.tools['rare_fragment'] || 0;
        const legendFrags = GameState.inventory.tools['legend_fragment'] || 0;

        if (rareFrags >= 10) {
            GameState.inventory.tools['rare_fragment'] -= 10;
            MysterySeeds.addBag('rare', 1);
            showNotification('🎉 10个稀有碎片合成了稀有种子袋！', 'gold');
        }
        if (legendFrags >= 5) {
            GameState.inventory.tools['legend_fragment'] -= 5;
            MysterySeeds.addBag('legendary', 1);
            showNotification('🎉 5个传说碎片合成了传说种子袋！', 'gold');
        }
    },

    // 播放钓获动画
    playCatchAnimation(fish) {
        const canvas = document.getElementById('qte-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let frame = 0;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const cx = canvas.width / 2, cy = canvas.height / 2;
            const scale = 1 + Math.sin(frame * 0.3) * 0.2;
            const y = cy - Math.abs(Math.sin(frame * 0.15)) * 40;

            ctx.save();
            ctx.translate(cx, y);
            ctx.scale(scale, scale);
            ctx.font = '48px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(fish.icon, 0, 0);
            ctx.restore();

            // 水花
            if (frame < 10) {
                ctx.font = '20px serif';
                ctx.fillText('💦', cx - 30, cy + 20);
                ctx.fillText('💦', cx + 30, cy + 20);
            }

            // 传说鱼：金色粒子
            if (fish.rarity === 'legendary') {
                for (let i = 0; i < 5; i++) {
                    const px = cx + Math.cos(frame * 0.2 + i * 1.2) * (50 + frame * 2);
                    const py = cy + Math.sin(frame * 0.2 + i * 1.2) * (50 + frame * 2);
                    ctx.beginPath();
                    ctx.arc(px, py, 3, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255,215,0,${1 - frame / 40})`;
                    ctx.fill();
                }
            }

            frame++;
            if (frame < 40) requestAnimationFrame(animate);
        };
        animate();

        this.updateFishingStatus(`🎣 钓到了 ${fish.name}！`, '#FFD700');
    },

    // 开始等待动画（浮漂）
    startWaitAnimation() {
        const canvas = document.getElementById('qte-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let frame = 0;

        // 取消之前的等待动画
        if (this.waitAnimFrame) {
            cancelAnimationFrame(this.waitAnimFrame);
            this.waitAnimFrame = null;
        }

        const animate = () => {
            if (this.state !== FISHING_STATE.WAITING) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const cx = canvas.width / 2, cy = canvas.height / 2;

            // 水面
            ctx.fillStyle = 'rgba(33,150,243,0.2)';
            ctx.fillRect(0, cy + 20, canvas.width, canvas.height - cy - 20);

            // 浮漂
            const bobY = cy + Math.sin(frame * 0.05) * 5;
            ctx.beginPath();
            ctx.arc(cx, bobY, 8, 0, Math.PI * 2);
            ctx.fillStyle = '#ff4444';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(cx, bobY + 12, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();

            // 钓线
            ctx.beginPath();
            ctx.moveTo(cx, 0);
            ctx.lineTo(cx, bobY - 8);
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.lineWidth = 1;
            ctx.stroke();

            frame++;
            this.waitAnimFrame = requestAnimationFrame(animate);
        };
        this.waitAnimFrame = requestAnimationFrame(animate);
    },


    // 和钓特效
    playBiteEffect() {
        const canvas = document.getElementById('qte-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const cx = canvas.width / 2, cy = canvas.height / 2;

        // 取消等待动画
        if (this.waitAnimFrame) {
            cancelAnimationFrame(this.waitAnimFrame);
            this.waitAnimFrame = null;
        }
        if (this.biteAnimFrame) {
            cancelAnimationFrame(this.biteAnimFrame);
            this.biteAnimFrame = null;
        }

        // 浮漂下沉动画
        let sinkY = 0;
        let frame = 0;
        const animate = () => {
            if (this.state !== FISHING_STATE.BITING) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            sinkY = Math.min(30, frame * 3);
            const bobY = cy + sinkY;

            ctx.fillStyle = 'rgba(33,150,243,0.2)';
            ctx.fillRect(0, cy + 20, canvas.width, canvas.height - cy - 20);

            ctx.beginPath();
            ctx.arc(cx, bobY, 8, 0, Math.PI * 2);
            ctx.fillStyle = '#ff4444';
            ctx.fill();

            // 点击提示
            ctx.font = 'bold 16px sans-serif';
            ctx.fillStyle = '#FFD700';
            ctx.textAlign = 'center';
            ctx.fillText('点击！', cx, cy - 30);

            frame++;
            if (frame < 20) {
                this.biteAnimFrame = requestAnimationFrame(animate);
            }
        };
        this.biteAnimFrame = requestAnimationFrame(animate);
    },

    // 闪烁QTE成功
    flashQTESuccess() {
        const canvas = document.getElementById('qte-canvas');
        if (!canvas) return;
        canvas.style.boxShadow = '0 0 20px #4CAF50';
        setTimeout(() => { canvas.style.boxShadow = ''; }, 300);
    },

    // 更新状态文字
    updateFishingStatus(text, color) {
        const el = document.getElementById('fishing-status');
        if (el) { el.textContent = text; el.style.color = color; }
    },

    // 显示钓鱼UI
    showFishingUI() {
        showModal('fishing-modal');
    },

    // 重置钓鱼状态
    resetFishing() {
        this.state = FISHING_STATE.IDLE;
        this.currentFish = null;
        this.qteRound = 0;
        clearTimeout(this.waitTimer);
        cancelAnimationFrame(this.animFrame);
        cancelAnimationFrame(this.waitAnimFrame);
        cancelAnimationFrame(this.biteAnimFrame);
        this.animFrame = null;
        this.waitAnimFrame = null;
        this.biteAnimFrame = null;

        const canvas = document.getElementById('qte-canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        this.updateFishingStatus('点击下方按鈕开始钓鱼', '#aaa');
    },

    // 关闭钓鱼
    closeFishing() {
        clearTimeout(this.waitTimer);
        cancelAnimationFrame(this.animFrame);
        cancelAnimationFrame(this.waitAnimFrame);
        cancelAnimationFrame(this.biteAnimFrame);
        this.animFrame = null;
        this.waitAnimFrame = null;
        this.biteAnimFrame = null;
        this.state = FISHING_STATE.IDLE;
        this.currentFish = null;
        hideModal('fishing-modal');
    }
};
