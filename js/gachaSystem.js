// ===== 3D扭蛋机与农场珍藏品系统 =====

// ── 扭蛋产出内容数据库 ──
const GACHA_ITEMS = {
    // 第一类：农场装饰品
    windmill_red:    { id: 'windmill_red',    name: '红色风车',   category: 'deco',   rarity: 'common',    icon: '🌀', color: 0xff4444, desc: '荷兰风格红色木质风车，叶片随风旋转' },
    windmill_blue:   { id: 'windmill_blue',   name: '蓝色风车',   category: 'deco',   rarity: 'common',    icon: '🌀', color: 0x4488ff, desc: '荷兰风格蓝色木质风车，叶片随风旋转' },
    windmill_wood:   { id: 'windmill_wood',   name: '原木风车',   category: 'deco',   rarity: 'common',    icon: '🌀', color: 0xaa7744, desc: '荷兰风格原木色风车，叶片随风旋转' },
    garden_lamp1:    { id: 'garden_lamp1',    name: '单头花园灯', category: 'deco',   rarity: 'common',    icon: '🏮', color: 0xffcc44, desc: '复古铸铁灯柱，夜间自动亮起暖黄色光芒' },
    garden_lamp2:    { id: 'garden_lamp2',    name: '双头花园灯', category: 'deco',   rarity: 'common',    icon: '🏮', color: 0xffcc44, desc: '双头复古铸铁灯柱，周围有萤火虫粒子' },
    scarecrow_farmer:{ id: 'scarecrow_farmer',name: '农夫稻草人', category: 'deco',   rarity: 'rare',      icon: '🎃', color: 0xddaa44, desc: '穿着农夫服装的稻草人，随风轻微摇摆' },
    scarecrow_wizard:{ id: 'scarecrow_wizard',name: '魔法师稻草人',category:'deco',   rarity: 'rare',      icon: '🎃', color: 0x8844cc, desc: '穿着魔法师服装的稻草人，乌鸦不敢靠近' },
    fountain:        { id: 'fountain',        name: '互动喷泉',   category: 'deco',   rarity: 'rare',      icon: '⛲', color: 0x88ccff, desc: '石质圆形喷泉，鸭子会被吸引过来戏水' },
    wishing_well:    { id: 'wishing_well',    name: '许愿井',     category: 'deco',   rarity: 'legendary', icon: '🪣', color: 0x888888, desc: '古老石砌水井，每日可投入1金币许愿' },
    // 第二类：动物皮肤
    hat_straw:       { id: 'hat_straw',       name: '草帽',       category: 'skin',   rarity: 'common',    icon: '👒', color: 0xddcc88, desc: '夏日风格草帽，适用于所有动物' },
    hat_top:         { id: 'hat_top',         name: '绅士礼帽',   category: 'skin',   rarity: 'common',    icon: '🎩', color: 0x222222, desc: '黑色高顶礼帽，适用于牛/羊' },
    hat_pirate:      { id: 'hat_pirate',      name: '海盗帽',     category: 'skin',   rarity: 'rare',      icon: '🏴‍☠️', color: 0x333333, desc: '带羽毛的海盗帽，适用于鸡/鸭' },
    hat_crown:       { id: 'hat_crown',       name: '金色皇冠',   category: 'skin',   rarity: 'legendary', icon: '👑', color: 0xffd700, desc: '金色小皇冠，适用于所有动物' },
    scarf_red:       { id: 'scarf_red',       name: '红色围巾',   category: 'skin',   rarity: 'common',    icon: '🧣', color: 0xff4444, desc: '温暖的红色毛线围巾' },
    scarf_rainbow:   { id: 'scarf_rainbow',   name: '彩虹围巾',   category: 'skin',   rarity: 'rare',      icon: '🌈', color: 0xff88ff, desc: '七彩渐变的彩虹围巾' },
    wings_angel:     { id: 'wings_angel',     name: '天使翅膀',   category: 'skin',   rarity: 'legendary', icon: '🪽', color: 0xffffff, desc: '白色羽翼，带有光芒粒子效果' },
    // 第三类：环境特效
    petal_cherry:    { id: 'petal_cherry',    name: '樱花花瓣拖尾',category:'effect', rarity: 'rare',      icon: '🌸', color: 0xffaacc, desc: '移动时身后飘落樱花花瓣' },
    petal_maple:     { id: 'petal_maple',     name: '枫叶拖尾',   category: 'effect', rarity: 'rare',      icon: '🍁', color: 0xff6622, desc: '移动时身后飘落枫叶' },
    firefly_glow:    { id: 'firefly_glow',    name: '萤火虫光点', category: 'effect', rarity: 'common',    icon: '✨', color: 0xaaffaa, desc: '夜间农场出现更多萤火虫，围绕玩家飞舞' },
    rainbow_bridge:  { id: 'rainbow_bridge',  name: '彩虹桥',     category: 'effect', rarity: 'legendary', icon: '🌈', color: 0xff88ff, desc: '雨后农场上空出现持久彩虹' },
    // 第四类：观赏植物
    glow_orchid:     { id: 'glow_orchid',     name: '蓝色荧光兰', category: 'plant',  rarity: 'rare',      icon: '🌺', color: 0x4488ff, desc: '夜间花瓣发出柔和蓝色荧光' },
    crystal_cactus:  { id: 'crystal_cactus',  name: '水晶仙人掌', category: 'plant',  rarity: 'legendary', icon: '🌵', color: 0x88ddff, desc: '半透明水晶质感，阳光照射时产生彩虹折射' },
    gold_apple_tree: { id: 'gold_apple_tree', name: '金苹果树',   category: 'plant',  rarity: 'legendary', icon: '🍎', color: 0xffd700, desc: '树上结满金色苹果，树下形成金色光斑' },
};

// 稀有度权重
const GACHA_RARITY_WEIGHTS = { common: 60, rare: 30, legendary: 10 };

// 稀有度颜色
const RARITY_COLORS = {
    common:    { ball: 0xffffff, glow: 0xdddddd, label: '普通',   css: '#aaa' },
    rare:      { ball: 0xffd700, glow: 0xffaa00, label: '稀有',   css: '#FFD700' },
    legendary: { ball: 0xff44ff, glow: 0xff00ff, label: '传说',   css: '#ff44ff' }
};

// 季节限定池（按月份）
const SEASONAL_ITEMS = {
    spring: ['petal_cherry', 'glow_orchid', 'hat_crown'],
    summer: ['firefly_glow', 'garden_lamp2', 'scarf_rainbow'],
    autumn: ['petal_maple', 'scarecrow_farmer', 'scarecrow_wizard'],
    winter: ['wishing_well', 'wings_angel', 'rainbow_bridge']
};

// ── 珍藏品属性组合 ──
const COLLECTION_COLORS = [
    '淡雅红','标准红','浓郁红','淡雅橙','标准橙','浓郁橙',
    '淡雅黄','标准黄','浓郁黄','淡雅绿','标准绿','浓郁绿',
    '淡雅青','标准青','浓郁青','淡雅蓝','标准蓝','浓郁蓝',
    '淡雅紫','标准紫','浓郁紫','淡雅粉','标准粉','浓郁粉'
];
const COLLECTION_PATTERNS = ['纯色', '条纹', '波点', '格纹', '渐变'];
const COLLECTION_EFFECTS  = ['无特效', '微光闪烁', '星尘环绕'];

// ── 扭蛋机主系统 ──
const GachaSystem = {
    machine: null,          // 3D机器Group
    glassball: null,        // 玻璃球
    lever: null,            // 摇杆
    innerEggs: [],          // 球内漂浮扭蛋
    isAnimating: false,     // 是否正在动画
    revealOverlay: null,    // 揭晓层DOM
    dailyTokenDate: null,   // 每日代币领取日期记录

    // ── 初始化 ──
    init(scene) {
        this.scene = scene;
        this.buildMachine(scene);
        this.revealOverlay = document.getElementById('gacha-reveal-overlay');
    },

    // ── 构建3D扭蛋机 ──
    buildMachine(scene) {
        const group = new THREE.Group();
        // 放置在农场东北角
        group.position.set(10, 0, -10);
        group.name = 'gachaMachine';

        // 黄铜底座
        const baseGeo = new THREE.CylinderGeometry(1.0, 1.2, 1.2, 16);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0xb8860b, metalness: 0.8, roughness: 0.3 });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = 0.6;
        group.add(base);

        // 底座装饰铆钉
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const rivetGeo = new THREE.SphereGeometry(0.06, 8, 8);
            const rivetMat = new THREE.MeshStandardMaterial({ color: 0xdaa520, metalness: 1.0, roughness: 0.1 });
            const rivet = new THREE.Mesh(rivetGeo, rivetMat);
            rivet.position.set(Math.cos(angle) * 0.95, 0.9, Math.sin(angle) * 0.95);
            group.add(rivet);
        }

        // 底座指示灯（交替闪烁）
        this.indicatorLights = [];
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const lightGeo = new THREE.SphereGeometry(0.08, 8, 8);
            const lightMat = new THREE.MeshStandardMaterial({ color: 0xff4400, emissive: 0xff4400, emissiveIntensity: 1.0 });
            const light = new THREE.Mesh(lightGeo, lightMat);
            light.position.set(Math.cos(angle) * 0.85, 1.25, Math.sin(angle) * 0.85);
            group.add(light);
            this.indicatorLights.push(light);
        }

        // 玻璃球支柱
        const pillarGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.5, 8);
        const pillarMat = new THREE.MeshStandardMaterial({ color: 0xb8860b, metalness: 0.9, roughness: 0.2 });
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.y = 1.45;
        group.add(pillar);

        // 透明玻璃球
        const ballGeo = new THREE.SphereGeometry(1.1, 32, 32);
        const ballMat = new THREE.MeshStandardMaterial({
            color: 0x88ccff, transparent: true, opacity: 0.25,
            metalness: 0.1, roughness: 0.0, side: THREE.DoubleSide
        });
        const ball = new THREE.Mesh(ballGeo, ballMat);
        ball.position.y = 2.4;
        group.add(ball);
        this.glassball = ball;

        // 球内漂浮扭蛋（5颗）
        const eggColors = [0xff4444, 0x44ff44, 0x4444ff, 0xffff44, 0xff44ff];
        this.innerEggs = [];
        for (let i = 0; i < 5; i++) {
            const eggGeo = new THREE.SphereGeometry(0.18, 12, 12);
            const eggMat = new THREE.MeshStandardMaterial({ color: eggColors[i], metalness: 0.3, roughness: 0.5 });
            const egg = new THREE.Mesh(eggGeo, eggMat);
            egg.position.set(
                (Math.random() - 0.5) * 1.2,
                2.4 + (Math.random() - 0.5) * 0.8,
                (Math.random() - 0.5) * 1.2
            );
            egg.userData.floatOffset = Math.random() * Math.PI * 2;
            group.add(egg);
            this.innerEggs.push(egg);
        }

        // 投币口（顶部）
        const slotGeo = new THREE.BoxGeometry(0.3, 0.08, 0.12);
        const slotMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9, roughness: 0.2 });
        const slot = new THREE.Mesh(slotGeo, slotMat);
        slot.position.set(0, 3.6, 0);
        group.add(slot);

        // 摇杆（侧面）
        const leverGroup = new THREE.Group();
        leverGroup.position.set(1.1, 1.8, 0);
        const rodGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.8, 8);
        const rodMat = new THREE.MeshStandardMaterial({ color: 0xb8860b, metalness: 0.8, roughness: 0.3 });
        const rod = new THREE.Mesh(rodGeo, rodMat);
        rod.rotation.z = Math.PI / 2;
        rod.position.x = 0.4;
        leverGroup.add(rod);
        const knobGeo = new THREE.SphereGeometry(0.18, 12, 12);
        const knobMat = new THREE.MeshStandardMaterial({ color: 0xff2222, metalness: 0.3, roughness: 0.4 });
        const knob = new THREE.Mesh(knobGeo, knobMat);
        knob.position.x = 0.85;
        leverGroup.add(knob);
        group.add(leverGroup);
        this.lever = leverGroup;

        // 出蛋口（底部半圆）
        const exitGeo = new THREE.TorusGeometry(0.35, 0.06, 8, 16, Math.PI);
        const exitMat = new THREE.MeshStandardMaterial({ color: 0xb8860b, metalness: 0.8, roughness: 0.3 });
        const exit = new THREE.Mesh(exitGeo, exitMat);
        exit.position.set(0, 0.3, 0.9);
        exit.rotation.x = Math.PI / 2;
        group.add(exit);

        // 机器标牌
        const signGeo = new THREE.BoxGeometry(1.2, 0.4, 0.05);
        const signMat = new THREE.MeshStandardMaterial({ color: 0xdaa520, metalness: 0.5, roughness: 0.5 });
        const sign = new THREE.Mesh(signGeo, signMat);
        sign.position.set(0, 1.6, 1.05);
        group.add(sign);

        // 周围小路石块
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const stoneGeo = new THREE.BoxGeometry(0.4, 0.08, 0.4);
            const stoneMat = new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.9 });
            const stone = new THREE.Mesh(stoneGeo, stoneMat);
            stone.position.set(Math.cos(angle) * 2.0, 0.04, Math.sin(angle) * 2.0);
            group.add(stone);
        }

        // 周围花坛
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
            const flowerColors = [0xff4488, 0xffaa00, 0xff4444, 0x44aaff];
            const flowerGeo = new THREE.SphereGeometry(0.12, 8, 8);
            const flowerMat = new THREE.MeshStandardMaterial({ color: flowerColors[i] });
            const flower = new THREE.Mesh(flowerGeo, flowerMat);
            flower.position.set(Math.cos(angle) * 1.8, 0.3, Math.sin(angle) * 1.8);
            group.add(flower);
        }

        // 可交互碰撞体（用于点击检测）
        const hitGeo = new THREE.CylinderGeometry(1.5, 1.5, 4, 8);
        const hitMat = new THREE.MeshBasicMaterial({ visible: false });
        const hitBox = new THREE.Mesh(hitGeo, hitMat);
        hitBox.position.y = 2;
        hitBox.name = 'gachaMachineHit';
        group.add(hitBox);

        scene.add(group);
        this.machine = group;
    },

    // ── 每帧更新（待机动画）──
    update(deltaTime) {
        if (!this.machine) return;
        const t = Date.now() * 0.001;

        // 球内扭蛋漂浮
        this.innerEggs.forEach((egg, i) => {
            egg.position.y = 2.4 + Math.sin(t * 0.8 + egg.userData.floatOffset) * 0.25;
            egg.rotation.y += deltaTime * 0.5;
        });

        // 指示灯闪烁
        if (this.indicatorLights) {
            this.indicatorLights.forEach((light, i) => {
                const on = Math.sin(t * 2 + i * Math.PI / 2) > 0;
                light.material.emissiveIntensity = on ? 1.0 : 0.1;
            });
        }

        // 玻璃球轻微旋转
        if (this.glassball) {
            this.glassball.rotation.y += deltaTime * 0.1;
        }
    },

    // ── 点击扭蛋机 ──
    onMachineClick() {
        if (this.isAnimating) return;
        this.showGachaPanel();
    },

    // ── 显示扭蛋面板 ──
    showGachaPanel() {
        const tokens = GameState.gacha?.tokens || 0;
        const panel = document.getElementById('gacha-panel');
        if (!panel) return;
        document.getElementById('gacha-token-count').textContent = tokens;
        // 更新季节限定提示
        const season = GameState.gameTime?.season || 'spring';
        const seasonNames = { spring: '春季', summer: '夏季', autumn: '秋季', winter: '冬季' };
        document.getElementById('gacha-season-label').textContent = `🌸 ${seasonNames[season]}限定池已激活`;
        panel.style.display = 'flex';
    },

    // ── 执行扭蛋 ──
    doGacha() {
        if (this.isAnimating) return;
        const tokens = GameState.gacha?.tokens || 0;
        if (tokens < 1) {
            showNotification('代币不足！完成每日任务或钓到传说鱼可获得代币', '🪙', 'warning');
            return;
        }

        // 扣除代币
        GameState.gacha.tokens -= 1;
        document.getElementById('gacha-token-count').textContent = GameState.gacha.tokens;

        // 抽取结果
        const result = this.rollItem();
        document.getElementById('gacha-panel').style.display = 'none';

        // 播放完整动画流程
        this.playGachaAnimation(result);
    },

    // ── 抽取物品 ──
    rollItem() {
        // 首次扭蛋保底稀有
        if (!GameState.gacha.hasFirstGacha) {
            GameState.gacha.hasFirstGacha = true;
            const rareItems = Object.values(GACHA_ITEMS).filter(i => i.rarity === 'rare');
            return rareItems[Math.floor(Math.random() * rareItems.length)];
        }

        // 按稀有度权重抽取
        const roll = Math.random() * 100;
        let rarity;
        if (roll < GACHA_RARITY_WEIGHTS.legendary) rarity = 'legendary';
        else if (roll < GACHA_RARITY_WEIGHTS.legendary + GACHA_RARITY_WEIGHTS.rare) rarity = 'rare';
        else rarity = 'common';

        // 加入季节限定池
        const season = GameState.gameTime?.season || 'spring';
        const seasonalIds = SEASONAL_ITEMS[season] || [];
        const pool = Object.values(GACHA_ITEMS).filter(i => i.rarity === rarity);
        // 季节限定物品额外权重
        const seasonalPool = pool.filter(i => seasonalIds.includes(i.id));
        const finalPool = [...pool, ...seasonalPool]; // 限定物品出现概率翻倍
        return finalPool[Math.floor(Math.random() * finalPool.length)];
    },

    // ── 完整动画流程 ──
    playGachaAnimation(item) {
        this.isAnimating = true;
        const overlay = document.getElementById('gacha-anim-overlay');
        overlay.style.display = 'flex';
        overlay.innerHTML = '';

        // 第一步：投币动画（0.8秒）
        this.animStep1_coin(overlay, () => {
            // 第二步：摇杆转动（1.2秒）
            this.animStep2_lever(() => {
                // 第三步：扭蛋滚落（1.5秒）
                this.animStep3_roll(overlay, item, () => {
                    // 第四步：外壳弹开（0.5-2秒）
                    this.animStep4_crack(overlay, item, () => {
                        // 第五步：揭晓
                        this.animStep5_reveal(overlay, item, () => {
                            this.isAnimating = false;
                            overlay.style.display = 'none';
                            // 生成珍藏品并存档
                            const collection = this.generateCollection(item);
                            this.showNamingDialog(collection);
                            GameState.save();
                        });
                    });
                });
            });
        });
    },

    // 第一步：投币
    animStep1_coin(overlay, cb) {
        overlay.innerHTML = `
            <div class="gacha-anim-bg"></div>
            <div id="gacha-coin" class="gacha-coin">🪙</div>
            <div class="gacha-step-hint">投入代币...</div>
        `;
        const coin = document.getElementById('gacha-coin');
        coin.style.animation = 'coinFly 0.8s ease-in forwards';
        // 机器发光
        if (this.machine) {
            this.indicatorLights?.forEach(l => { l.material.emissiveIntensity = 2.0; });
        }
        setTimeout(cb, 900);
    },

    // 第二步：摇杆转动
    animStep2_lever(cb) {
        if (!this.lever) { cb(); return; }
        let angle = 0;
        const target = Math.PI * 1.5; // 270度
        const duration = 1200;
        const start = Date.now();
        const animate = () => {
            const progress = Math.min((Date.now() - start) / duration, 1);
            this.lever.rotation.z = -progress * target;
            // 球内扭蛋剧烈滚动
            this.innerEggs.forEach((egg, i) => {
                egg.position.x = Math.sin(Date.now() * 0.01 + i) * 0.8;
                egg.position.z = Math.cos(Date.now() * 0.01 + i) * 0.8;
            });
            if (progress < 1) requestAnimationFrame(animate);
            else {
                // 摇杆复位
                setTimeout(() => { this.lever.rotation.z = 0; }, 300);
                cb();
            }
        };
        animate();
    },

    // 第三步：扭蛋滚落
    animStep3_roll(overlay, item, cb) {
        const rarityColor = RARITY_COLORS[item.rarity];
        const ballColor = `#${rarityColor.ball.toString(16).padStart(6, '0')}`;
        overlay.innerHTML = `
            <div class="gacha-anim-bg"></div>
            <div id="gacha-rolling-egg" class="gacha-rolling-egg" style="background:${ballColor}">
                <div class="gacha-egg-shine"></div>
            </div>
            <div class="gacha-step-hint">扭蛋滚落中...</div>
        `;
        const egg = document.getElementById('gacha-rolling-egg');
        egg.style.animation = 'eggRoll 1.5s ease-out forwards';
        setTimeout(cb, 1600);
    },

    // 第四步：外壳弹开
    animStep4_crack(overlay, item, cb) {
        const rarityColor = RARITY_COLORS[item.rarity];
        const ballColor = `#${rarityColor.ball.toString(16).padStart(6, '0')}`;
        const glowColor = `#${rarityColor.glow.toString(16).padStart(6, '0')}`;
        const duration = item.rarity === 'legendary' ? 2000 : item.rarity === 'rare' ? 1200 : 600;

        overlay.innerHTML = `
            <div class="gacha-anim-bg"></div>
            <div class="gacha-crack-container">
                <div class="gacha-shell-left" style="background:${ballColor}"></div>
                <div class="gacha-shell-right" style="background:${ballColor}"></div>
                <div class="gacha-crack-glow" style="background:radial-gradient(circle, ${glowColor}, transparent)"></div>
                ${item.rarity === 'legendary' ? '<div class="gacha-rainbow-pillar"></div>' : ''}
            </div>
            <div class="gacha-step-hint">${item.rarity === 'legendary' ? '✨ 传说降临！' : '外壳弹开！'}</div>
        `;
        const left = overlay.querySelector('.gacha-shell-left');
        const right = overlay.querySelector('.gacha-shell-right');
        left.style.animation = `shellLeft ${duration}ms ease-out forwards`;
        right.style.animation = `shellRight ${duration}ms ease-out forwards`;
        setTimeout(cb, duration + 100);
    },

    // 第五步：揭晓
    animStep5_reveal(overlay, item, cb) {
        const rarityColor = RARITY_COLORS[item.rarity];
        const duration = item.rarity === 'legendary' ? 5000 : item.rarity === 'rare' ? 3500 : 2000;
        const glowColor = `#${rarityColor.glow.toString(16).padStart(6, '0')}`;

        let extraHTML = '';
        if (item.rarity === 'legendary') {
            extraHTML = `
                <div class="gacha-fireworks"></div>
                <div class="gacha-rainbow-pillar-big"></div>
            `;
        }

        overlay.innerHTML = `
            <div class="gacha-reveal-bg ${item.rarity}"></div>
            ${extraHTML}
            <div class="gacha-reveal-item" style="animation: revealRise ${duration * 0.4}ms ease-out forwards">
                <div class="gacha-item-icon">${item.icon}</div>
                <div class="gacha-item-glow" style="background:radial-gradient(circle, ${glowColor}88, transparent)"></div>
            </div>
            <div class="gacha-reveal-info" style="animation: revealInfo 0.5s ease-out ${duration * 0.3}ms both">
                <div class="gacha-item-name">${item.name}</div>
                <div class="gacha-item-rarity" style="color:${rarityColor.css}">★ ${rarityColor.label}</div>
                <div class="gacha-item-desc">${item.desc}</div>
            </div>
            <button class="gacha-confirm-btn" onclick="GachaSystem._confirmReveal()" style="animation: revealInfo 0.5s ease-out ${duration * 0.6}ms both">
                太棒了！
            </button>
        `;

        // 传说级：相机拉远效果
        if (item.rarity === 'legendary' && typeof Scene3D !== 'undefined') {
            const origDist = Scene3D.cameraDistance;
            Scene3D.cameraDistance = origDist * 1.5;
            setTimeout(() => { Scene3D.cameraDistance = origDist; }, duration);
        }

        this._revealCallback = cb;
    },

    _confirmReveal(cb) {
        if (this._revealCallback) {
            this._revealCallback();
            this._revealCallback = null;
        }
    },

    // ── 生成珍藏品 ──
    generateCollection(item) {
        if (!GameState.gacha.collections) GameState.gacha.collections = [];
        if (!GameState.gacha.dailySeq) GameState.gacha.dailySeq = {};

        const today = new Date();
        const dateStr = today.getFullYear().toString() +
            String(today.getMonth() + 1).padStart(2, '0') +
            String(today.getDate()).padStart(2, '0');

        // 当日序号递增
        if (!GameState.gacha.dailySeq[dateStr]) GameState.gacha.dailySeq[dateStr] = 0;
        GameState.gacha.dailySeq[dateStr]++;
        const seq = String(GameState.gacha.dailySeq[dateStr]).padStart(5, '0');
        const serialNo = `FC-${dateStr}-${seq}`;

        // 随机属性组合
        const colorAttr   = COLLECTION_COLORS[Math.floor(Math.random() * COLLECTION_COLORS.length)];
        const patternAttr = COLLECTION_PATTERNS[Math.floor(Math.random() * COLLECTION_PATTERNS.length)];
        // 传说必有粒子特效
        const effectPool  = item.rarity === 'legendary'
            ? COLLECTION_EFFECTS.slice(1)
            : COLLECTION_EFFECTS;
        const effectAttr  = effectPool[Math.floor(Math.random() * effectPool.length)];

        const collection = {
            id: serialNo,
            itemId: item.id,
            name: item.name + ' ' + seq,  // 默认名称
            serialNo,
            rarity: item.rarity,
            icon: item.icon,
            category: item.category,
            desc: item.desc,
            colorAttr,
            patternAttr,
            effectAttr,
            obtainDate: today.toLocaleDateString(),
            obtainTimestamp: Date.now()
        };

        GameState.gacha.collections.push(collection);

        // 解锁图鉴珍藏品条目
        if (typeof Pokedex !== 'undefined') {
            Pokedex.unlock('collection', item.id, { icon: item.icon, name: item.name, rarity: item.rarity });
        }

        // 更新每日任务进度（扭蛋）
        if (typeof GameState !== 'undefined') {
            GameState.updateQuestProgress('gacha', 1);
        }

        return collection;
    },

    // ── 命名弹窗 ──
    showNamingDialog(collection) {
        const dialog = document.getElementById('gacha-naming-dialog');
        if (!dialog) return;
        document.getElementById('gacha-naming-icon').textContent = collection.icon;
        document.getElementById('gacha-naming-serial').textContent = collection.serialNo;
        document.getElementById('gacha-naming-input').value = collection.name;
        document.getElementById('gacha-naming-rarity').textContent =
            `★ ${RARITY_COLORS[collection.rarity]?.label || collection.rarity}`;
        document.getElementById('gacha-naming-rarity').style.color =
            RARITY_COLORS[collection.rarity]?.css || '#aaa';
        document.getElementById('gacha-naming-attrs').textContent =
            `${collection.colorAttr} · ${collection.patternAttr} · ${collection.effectAttr}`;
        dialog.style.display = 'flex';
        dialog.dataset.collectionId = collection.serialNo;
    },

    // ── 确认命名 ──
    confirmNaming() {
        const dialog = document.getElementById('gacha-naming-dialog');
        const input = document.getElementById('gacha-naming-input');
        const serialNo = dialog.dataset.collectionId;
        const name = input.value.trim().slice(0, 12) || '无名珍藏';

        const col = GameState.gacha.collections.find(c => c.serialNo === serialNo);
        if (col) col.name = name;

        dialog.style.display = 'none';
        GameState.save();
        showNotification(`🎁 珍藏品「${name}」已存入图鉴！`, 'gold');

        // 刷新图鉴（如果已打开）
        if (document.getElementById('pokedex-modal')?.style.display !== 'none') {
            Pokedex.render('collection');
        }
    },

    // ── 代币获取 ──
    addTokens(amount, reason) {
        if (!GameState.gacha) GameState.gacha = { tokens: 0, collections: [], hasFirstGacha: false, dailySeq: {} };
        GameState.gacha.tokens = (GameState.gacha.tokens || 0) + amount;
        showNotification(`🪙 获得 ${amount} 枚扭蛋代币！（${reason}）`, 'gold');
        // 更新面板显示
        const el = document.getElementById('gacha-token-count');
        if (el) el.textContent = GameState.gacha.tokens;
        GameState.save();
    },

    // ── 检查每日任务代币奖励 ──
    checkDailyTaskTokens() {
        if (!GameState.quests?.daily) return;
        const completedCount = Object.values(GameState.quests.daily).filter(q => q.completed).length;
        const today = new Date().toDateString();
        if (!GameState.gacha) GameState.gacha = { tokens: 0, collections: [], hasFirstGacha: false, dailySeq: {} };
        if (completedCount >= 3 && GameState.gacha.lastDailyTokenDate !== today) {
            GameState.gacha.lastDailyTokenDate = today;
            this.addTokens(1, '完成3个每日任务');
        }
    },

    // ── 检查图鉴里程碑代币奖励 ──
    checkPokedexTokens() {
        if (!GameState.gacha) return;
        const { percent } = typeof Pokedex !== 'undefined' ? Pokedex.getCompletion() : { percent: 0 };
        const milestones = [
            { percent: 25, tokens: 2 },
            { percent: 50, tokens: 3 },
            { percent: 75, tokens: 4 },
            { percent: 100, tokens: 5 }
        ];
        if (!GameState.gacha.pokedexTokenMilestones) GameState.gacha.pokedexTokenMilestones = new Set();
        milestones.forEach(m => {
            if (percent >= m.percent && !GameState.gacha.pokedexTokenMilestones.has(m.percent)) {
                GameState.gacha.pokedexTokenMilestones.add(m.percent);
                this.addTokens(m.tokens, `图鉴完成度${m.percent}%`);
            }
        });
    },

    // ── 传说鱼钓获代币 ──
    onLegendaryFishCaught(fishId) {
        this.addTokens(1, '钓获传说鱼');
        // 传说鱼可制作标本
        const fishData = FISH_DATA[fishId];
        if (fishData && typeof Pokedex !== 'undefined') {
            const specimenItem = {
                id: `specimen_${fishId}`,
                name: `${fishData.name}标本`,
                category: 'specimen',
                rarity: 'legendary',
                icon: fishData.icon,
                desc: `传说级鱼类标本，捕获于 ${new Date().toLocaleDateString()}`
            };
            const col = this.generateCollection(specimenItem);
            this.showNamingDialog(col);
        }
    },

    // ── 农场扩张代币 ──
    onFarmExpand() {
        this.addTokens(3, '农场扩张');
    },

    // ── 动物好感度代币（每日检查）──
    checkAnimalTokens() {
        if (!GameState.animals) return;
        const today = new Date().toDateString();
        if (!GameState.gacha) GameState.gacha = { tokens: 0, collections: [], hasFirstGacha: false, dailySeq: {} };
        if (!GameState.gacha.animalTokenDate) GameState.gacha.animalTokenDate = {};

        GameState.animals.forEach(animal => {
            if ((animal.affection || 0) >= 100 && Math.random() < 0.1) {
                const key = `${animal.id}_${today}`;
                if (!GameState.gacha.animalTokenDate[key]) {
                    GameState.gacha.animalTokenDate[key] = true;
                    this.addTokens(1, `${animal.name}产出代币`);
                    showNotification(`🪙 ${animal.name} 头顶出现金色扭蛋图标！`, '💛');
                }
            }
        });
    },

    // ── 渲染珍藏品图鉴 ──
    renderCollectionPokedex(grid) {
        const collections = GameState.gacha?.collections || [];
        const allItems = Object.values(GACHA_ITEMS);

        allItems.forEach(item => {
            const owned = collections.filter(c => c.itemId === item.id);
            const el = document.createElement('div');
            el.className = `pokedex-entry ${owned.length > 0 ? 'unlocked' : 'locked'}`;
            const rarityBorder = {
                rare: '1px solid rgba(255,215,0,0.5)',
                legendary: '1px solid rgba(255,68,255,0.6)'
            }[item.rarity] || '1px solid rgba(255,255,255,0.1)';
            el.style.border = rarityBorder;

            if (owned.length > 0) {
                const latest = owned[owned.length - 1];
                el.innerHTML = `
                    <div class="entry-icon">${item.icon}</div>
                    <div class="entry-name" style="color:${RARITY_COLORS[item.rarity]?.css || '#ddd'}">${item.name}</div>
                    <div class="entry-time">×${owned.length}</div>
                `;
                el.onclick = () => this.showCollectionDetail(latest);
            } else {
                el.innerHTML = `
                    <div class="entry-icon entry-silhouette">❓</div>
                    <div class="entry-name" style="color:#555">???</div>
                    <div class="entry-hint">扭蛋机获得</div>
                `;
            }
            grid.appendChild(el);
        });

        // 如果没有任何珍藏品，显示提示
        if (collections.length === 0) {
            const hint = document.createElement('div');
            hint.style.cssText = 'grid-column:1/-1;text-align:center;color:#666;padding:30px;font-size:14px';
            hint.innerHTML = '🪙 前往农场东北角的扭蛋机，开始收集珍藏品吧！';
            grid.appendChild(hint);
        }
    },

    // ── 珍藏品详情 ──
    showCollectionDetail(col) {
        const overlay = document.getElementById('pokedex-detail-overlay');
        if (!overlay) return;
        const rarityLabel = RARITY_COLORS[col.rarity]?.label || col.rarity;
        const rarityColor = RARITY_COLORS[col.rarity]?.css || '#aaa';
        document.getElementById('pokedex-detail-content').innerHTML = `
            <div style="font-size:56px;text-align:center;margin:10px 0">${col.icon}</div>
            <div style="font-size:18px;font-weight:bold;text-align:center;color:#fff;margin-bottom:4px">${col.name}</div>
            <div style="text-align:center;color:${rarityColor};font-size:13px;margin-bottom:8px">★ ${rarityLabel}</div>
            <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:10px;margin-bottom:8px">
                <div style="color:#ffd700;font-size:12px;margin-bottom:4px">🔖 序列号</div>
                <div style="color:#fff;font-size:14px;font-family:monospace">${col.serialNo}</div>
            </div>
            <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:10px;margin-bottom:8px">
                <div style="color:#aaa;font-size:12px">🎨 ${col.colorAttr} · ${col.patternAttr} · ${col.effectAttr}</div>
                <div style="color:#aaa;font-size:12px;margin-top:4px">📅 获取于 ${col.obtainDate}</div>
            </div>
            <div style="color:#888;font-size:12px;text-align:center">${col.desc}</div>
            <button class="btn-primary" onclick="document.getElementById('pokedex-detail-overlay').style.display='none'" style="margin-top:12px;width:100%">关闭</button>
        `;
        overlay.style.display = 'flex';
    }
};
