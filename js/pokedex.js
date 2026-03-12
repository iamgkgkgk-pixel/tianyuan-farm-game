// ===== 农场图鉴馆系统 =====

// 图鉴分类配置
const POKEDEX_CATEGORIES = {
    plant: {
        name: '植物图鉴',
        icon: '🌿',
        total: 26, // 16种 + 10种变异
        entries: {}
    },
    animal: {
        name: '动物图鉴',
        icon: '🐾',
        total: 8,
        entries: {}
    },
    fish: {
        name: '鱼类图鉴',
        icon: '🐟',
        total: 15,
        entries: {}
    },
    achievement: {
        name: '成就勋章',
        icon: '🏅',
        total: 20,
        entries: {}
    },
    collection: {
        name: '珍藏品',
        icon: '🌟',
        total: 27, // GACHA_ITEMS数量
        entries: {}
    }
};


// 鱼类数据
const FISH_DATA = {
    // 普通鱼类
    crucian: { id: 'crucian', name: '鲫鱼', icon: '🐟', rarity: 'common', desc: '最常见的淡水鱼', season: 'all', weather: 'all', time: 'all', prob: 0.25 },
    carp: { id: 'carp', name: '鲤鱼', icon: '🐠', rarity: 'common', desc: '吉祥如意的鲤鱼', season: 'all', weather: 'all', time: 'all', prob: 0.20 },
    grass_carp: { id: 'grass_carp', name: '草鱼', icon: '🐡', rarity: 'common', desc: '喜欢水草的草鱼', season: ['spring','summer'], weather: 'sunny', time: 'day', prob: 0.15 },
    catfish: { id: 'catfish', name: '鲶鱼', icon: '🐟', rarity: 'common', desc: '底栖的鲶鱼', season: 'all', weather: 'all', time: 'night', prob: 0.12 },
    loach: { id: 'loach', name: '泥鳅', icon: '🐍', rarity: 'common', desc: '泥里的小精灵', season: 'all', weather: 'rainy', time: 'all', prob: 0.10 },
    crayfish: { id: 'crayfish', name: '小龙虾', icon: '🦞', rarity: 'common', desc: '美味的小龙虾', season: ['spring','summer'], weather: 'all', time: 'evening', prob: 0.08 },
    clam: { id: 'clam', name: '河蚌', icon: '🦪', rarity: 'common', desc: '珍珠的摇篮', season: 'all', weather: 'all', time: 'all', prob: 0.06 },
    snail: { id: 'snail', name: '田螺', icon: '🐌', rarity: 'common', desc: '慢悠悠的田螺', season: 'all', weather: 'all', time: 'all', prob: 0.05 },
    // 稀有鱼类
    goldfish: { id: 'goldfish', name: '金鱼', icon: '🐠', rarity: 'rare', desc: '美丽的观赏金鱼', season: ['spring','autumn'], weather: 'sunny', time: 'day', prob: 0.05 },
    koi: { id: 'koi', name: '锦鲤', icon: '🐟', rarity: 'rare', desc: '带来好运的锦鲤', season: 'summer', weather: 'rainy', time: 'evening', prob: 0.03 },
    turtle: { id: 'turtle', name: '甲鱼', icon: '🐢', rarity: 'rare', desc: '长寿的甲鱼', season: ['summer','autumn'], weather: 'all', time: 'day', prob: 0.03 },
    mandarin_fish: { id: 'mandarin_fish', name: '鳜鱼', icon: '🐡', rarity: 'rare', desc: '桃花流水鳜鱼肥', season: 'spring', weather: 'all', time: 'all', prob: 0.02 },
    bass: { id: 'bass', name: '鲈鱼', icon: '🐟', rarity: 'rare', desc: '肉质鲜美的鲈鱼', season: ['spring','summer'], weather: 'cloudy', time: 'morning', prob: 0.02 },
    // 传说鱼类
    dragon_fish: { id: 'dragon_fish', name: '神龙鱼', icon: '🐉', rarity: 'legendary', desc: '传说中的神龙鱼，冬日雪夜方可见', season: 'winter', weather: 'snow', time: 'midnight', prob: 0.005 },
    rainbow_trout: { id: 'rainbow_trout', name: '彩虹鳟', icon: '🌈', rarity: 'legendary', desc: '彩虹天气清晨出没的神秘鱼', season: 'spring', weather: 'rainbow', time: 'morning', prob: 0.003 }
};

// 图鉴里程碑奖励
const POKEDEX_MILESTONES = [
    { percent: 25, reward: { type: 'seed_bag', bagType: 'legendary', count: 1 }, title: '初出茅庐的收藏家', icon: '🌱' },
    { percent: 50, reward: { type: 'deco', decoId: 'golden_scarecrow' }, title: '经验丰富的农场主', icon: '🌟' },
    { percent: 75, reward: { type: 'seed_bag', bagType: 'legendary', count: 2, title: true }, title: '博学多识的博物学家', icon: '📚' },
    { percent: 100, reward: { type: 'deco', decoId: 'rainbow_fountain', title: true }, title: '传奇农场大师', icon: '🏆' }
];

// 图鉴系统
const Pokedex = {
    // 解锁图鉴条目
    unlock(category, entryId, data = {}) {
        if (!GameState.pokedex) GameState.pokedex = {};
        if (!GameState.pokedex[category]) GameState.pokedex[category] = {};

        const isNew = !GameState.pokedex[category][entryId];

        GameState.pokedex[category][entryId] = {
            ...data,
            unlocked: true,
            firstTime: data.firstTime || Date.now()
        };

        if (isNew) {
            this.showUnlockAnimation(category, entryId, data);
            this.checkMilestones();
            GameState.save();
        }
    },

    // 检查是否已解锁
    isUnlocked(category, entryId) {
        return !!(GameState.pokedex && GameState.pokedex[category] && GameState.pokedex[category][entryId]);
    },

    // 获取完成度
    getCompletion() {
        if (!GameState.pokedex) return { total: 0, unlocked: 0, percent: 0 };
        let total = 0, unlocked = 0;
        Object.values(POKEDEX_CATEGORIES).forEach(cat => {
            total += cat.total;
        });
        Object.values(GameState.pokedex).forEach(catData => {
            unlocked += Object.keys(catData).length;
        });
        return { total, unlocked, percent: Math.floor((unlocked / total) * 100) };
    },

    // 检查里程碑
    checkMilestones() {
        const { percent } = this.getCompletion();
        if (!GameState.pokedexMilestones) GameState.pokedexMilestones = new Set();

        POKEDEX_MILESTONES.forEach(milestone => {
            if (percent >= milestone.percent && !GameState.pokedexMilestones.has(milestone.percent)) {
                GameState.pokedexMilestones.add(milestone.percent);
                this.grantMilestoneReward(milestone);
            }
        });
    },

    // 发放里程碑奖励
    grantMilestoneReward(milestone) {
        const r = milestone.reward;
        if (r.type === 'seed_bag') {
            MysterySeeds.addBag(r.bagType, r.count);
        } else if (r.type === 'deco') {
            showNotification(`🎁 解锁装饰：${r.decoId}！`, 'gold');
        }
        if (r.title) {
            GameState.player.title = milestone.title;
        }

        // 显示里程碑弹窗
        const overlay = document.getElementById('milestone-overlay');
        if (overlay) {
            document.getElementById('milestone-icon').textContent = milestone.icon;
            document.getElementById('milestone-title').textContent = milestone.title;
            document.getElementById('milestone-percent').textContent = `图鉴完成度 ${milestone.percent}%`;
            overlay.style.display = 'flex';
            setTimeout(() => { overlay.style.display = 'none'; }, 4000);
        }
    },

    // 解锁动画
    showUnlockAnimation(category, entryId, data) {
        const overlay = document.getElementById('pokedex-unlock-overlay');
        if (!overlay) return;

        let icon = '❓', name = '新发现';
        if (category === 'plant' && data.cropId && CROPS_DATA[data.cropId]) {
            const crop = CROPS_DATA[data.cropId];
            icon = crop.icon;
            name = crop.name + (data.mutation ? MUTATION_DESC[data.mutation]?.suffix || '' : '');
        } else if (category === 'fish' && FISH_DATA[entryId]) {
            icon = FISH_DATA[entryId].icon;
            name = FISH_DATA[entryId].name;
        } else if (category === 'animal' && ANIMALS_DATA[entryId]) {
            icon = ANIMALS_DATA[entryId].icon;
            name = ANIMALS_DATA[entryId].name;
        }

        document.getElementById('pokedex-unlock-icon').textContent = icon;
        document.getElementById('pokedex-unlock-name').textContent = name;
        document.getElementById('pokedex-unlock-cat').textContent = POKEDEX_CATEGORIES[category]?.name || '图鉴';

        overlay.style.display = 'flex';
        setTimeout(() => { overlay.style.display = 'none'; }, 2500);
    },

    // 渲染图鉴UI
    render(category = 'plant') {
        const content = document.getElementById('pokedex-content');
        if (!content) return;
        content.innerHTML = '';

        const { unlocked, total, percent } = this.getCompletion();

        // 完成度头部
        const header = document.createElement('div');
        header.className = 'pokedex-header';
        header.innerHTML = `
            <div class="pokedex-progress-text">已收集 ${unlocked} / ${total} 条目 (${percent}%)</div>
            <div class="pokedex-progress-bg"><div class="pokedex-progress-bar" style="width:${percent}%"></div></div>
            <div class="pokedex-milestones">
                ${POKEDEX_MILESTONES.map(m => {
                    const done = GameState.pokedexMilestones && GameState.pokedexMilestones.has(m.percent);
                    return `<div class="milestone-dot ${done ? 'done' : ''}" title="${m.title}">${m.icon}</div>`;
                }).join('')}
            </div>
        `;
        content.appendChild(header);

        // 分类Tab
        const tabs = document.createElement('div');
        tabs.className = 'tabs';
        Object.entries(POKEDEX_CATEGORIES).forEach(([key, cat]) => {
            const btn = document.createElement('button');
            btn.className = `tab-btn ${key === category ? 'active' : ''}`;
            btn.textContent = `${cat.icon} ${cat.name}`;
            btn.onclick = () => this.render(key);
            tabs.appendChild(btn);
        });
        content.appendChild(tabs);

        // 条目网格
        const grid = document.createElement('div');
        grid.className = 'pokedex-grid';

        if (category === 'plant') {
            this.renderPlantEntries(grid);
        } else if (category === 'fish') {
            this.renderFishEntries(grid);
        } else if (category === 'animal') {
            this.renderAnimalEntries(grid);
        } else if (category === 'achievement') {
            this.renderAchievementEntries(grid);
        } else if (category === 'collection') {
            if (typeof GachaSystem !== 'undefined') {
                GachaSystem.renderCollectionPokedex(grid);
            }
        }

        content.appendChild(grid);
    },

    renderPlantEntries(grid) {
        // 基础16种植物
        Object.values(CROPS_DATA).forEach(crop => {
            const unlocked = this.isUnlocked('plant', crop.id);
            const entry = GameState.pokedex?.plant?.[crop.id];
            grid.appendChild(this.createEntry(crop.icon, crop.name, unlocked, entry, crop.type, '种植神秘种子获得'));
        });
        // 变异条目（10种）
        const mutations = ['color', 'size_big', 'size_small', 'shiny'];
        const mutCrops = ['radish', 'tomato', 'strawberry', 'goldApple', 'sunflower',
                          'corn', 'blueberry', 'pumpkin', 'rainbowRose', 'wheat'];
        mutCrops.slice(0, 10).forEach((cropId, i) => {
            const mut = mutations[i % mutations.length];
            const entryId = `${cropId}_${mut}`;
            const crop = CROPS_DATA[cropId];
            const unlocked = this.isUnlocked('plant', entryId);
            const entry = GameState.pokedex?.plant?.[entryId];
            const mutInfo = MUTATION_DESC[mut];
            grid.appendChild(this.createEntry(
                crop.icon, crop.name + mutInfo.suffix, unlocked, entry, 'mutation',
                `神秘种子变异（${mutInfo.label}）`
            ));
        });
    },

    renderFishEntries(grid) {
        Object.values(FISH_DATA).forEach(fish => {
            const unlocked = this.isUnlocked('fish', fish.id);
            const entry = GameState.pokedex?.fish?.[fish.id];
            grid.appendChild(this.createEntry(fish.icon, fish.name, unlocked, entry, fish.rarity, '钓鱼获得'));
        });
    },

    renderAnimalEntries(grid) {
        Object.values(ANIMALS_DATA).forEach(animal => {
            const unlocked = this.isUnlocked('animal', animal.id);
            const entry = GameState.pokedex?.animal?.[animal.id];
            grid.appendChild(this.createEntry(animal.icon, animal.name, unlocked, entry, animal.type, '购买并养成动物'));
        });
    },

    renderAchievementEntries(grid) {
        ACHIEVEMENTS_DATA.forEach(ach => {
            const unlocked = GameState.achievements.has(ach.id);
            grid.appendChild(this.createEntry(ach.icon, ach.name, unlocked, null, ach.rarity, ach.desc));
        });
    },

    createEntry(icon, name, unlocked, entry, rarity, hint) {
        const rarityColors = {
            common: '#aaa', normal: '#aaa', fast: '#aaa',
            rare: '#4CAF50', uncommon: '#4CAF50',
            legendary: '#FFD700', epic: '#9C27B0', fantasy: '#FF88FF',
            mutation: '#FF6B6B', poultry: '#aaa', livestock: '#aaa'
        };
        const rarityBorders = {
            rare: '1px solid rgba(76,175,80,0.5)',
            legendary: '1px solid rgba(255,215,0,0.6)',
            mutation: '1px solid rgba(255,107,107,0.5)',
            fantasy: '1px solid rgba(255,136,255,0.5)'
        };

        const el = document.createElement('div');
        el.className = `pokedex-entry ${unlocked ? 'unlocked' : 'locked'}`;
        el.style.border = rarityBorders[rarity] || '1px solid rgba(255,255,255,0.1)';

        if (unlocked) {
            const timeStr = entry?.firstTime ? new Date(entry.firstTime).toLocaleDateString() : '';
            el.innerHTML = `
                <div class="entry-icon">${icon}</div>
                <div class="entry-name" style="color:${rarityColors[rarity] || '#ddd'}">${name}</div>
                ${timeStr ? `<div class="entry-time">${timeStr}</div>` : ''}
            `;
            el.onclick = () => this.showDetail(icon, name, rarity, entry, hint);
        } else {
            el.innerHTML = `
                <div class="entry-icon entry-silhouette">❓</div>
                <div class="entry-name" style="color:#555">???</div>
                <div class="entry-hint">${hint}</div>
            `;
        }

        return el;
    },

    showDetail(icon, name, rarity, entry, hint) {
        const overlay = document.getElementById('pokedex-detail-overlay');
        if (!overlay) return;
        const rarityLabel = { common: '普通', fast: '普通', normal: '普通', rare: '稀有', legendary: '传说', mutation: '变异', fantasy: '奇幻', epic: '史诗' }[rarity] || rarity;
        const rarityColor = { rare: '#4CAF50', legendary: '#FFD700', mutation: '#FF6B6B', fantasy: '#FF88FF', epic: '#9C27B0' }[rarity] || '#aaa';
        const timeStr = entry?.firstTime ? new Date(entry.firstTime).toLocaleDateString() : '';

        document.getElementById('pokedex-detail-content').innerHTML = `
            <div style="font-size:64px;text-align:center;margin:10px 0">${icon}</div>
            <div style="font-size:20px;font-weight:bold;text-align:center;color:#fff;margin-bottom:5px">${name}</div>
            <div style="text-align:center;color:${rarityColor};font-size:14px;margin-bottom:10px">★ ${rarityLabel}</div>
            ${timeStr ? `<div style="text-align:center;color:#aaa;font-size:12px">首次获得：${timeStr}</div>` : ''}
            <div style="color:#aaa;font-size:12px;text-align:center;margin-top:8px">${hint}</div>
            <button class="btn-primary" onclick="document.getElementById('pokedex-detail-overlay').style.display='none'" style="margin-top:15px;width:100%">关闭</button>
        `;
        overlay.style.display = 'flex';
    }
};
