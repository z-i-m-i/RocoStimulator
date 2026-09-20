(function() {
  'use strict';

  // ============================================================
  // 数据定义
  // ============================================================

  var PARTICLES = ['四角星', '爱心', '方块', '五角星'];
  var PARTICLE_PROB = { '四角星': 0.60, '爱心': 0.30, '方块': 0.09, '五角星': 0.01 };
  var PARTICLE_ICONS = { '四角星': '✦', '爱心': '♥', '方块': '◆', '五角星': '★' };

  var TALENTS = {
    '无': 0.64,
    '奇袭': 0.0576,
    '亲密': 0.0576,
    '灵巧': 0.0576,
    '疾行': 0.0576,
    '同乘': 0.0576,
    '无畏': 0.0576,
    '爱分享': 0.0048,
    '家里蹲': 0.0048,
    '热心教': 0.0048,
    '慈悲为怀': 0.0001
  };

  var PERSONALITIES = [
    '大胆', '固执', '调皮', '勇敢', '逞强', '稳重', '天真', '懒散',
    '悠闲', '坦率', '聪明', '专注', '偏执', '冷静', '理性', '警惕',
    '温顺', '害羞', '慎重', '焦虑', '胆小', '急躁', '开朗', '莽撞',
    '热情', '沉默', '忧郁', '平和', '粗心', '踏实'
  ];

  var NORMAL_COLORS = [
    '草莓.芒果', '蓝莓.草莓', '蓝莓.芒果', '蓝莓.抹茶', '蓝莓.薄荷', '蓝莓.葡萄',
    '抹茶.草莓', '抹茶.芒果', '抹茶.薄荷', '抹茶.葡萄',
    '蜜桃.芒果', '蜜桃.蓝莓', '蜜桃.葡萄',
    '柠檬.蓝莓', '柠檬.抹茶', '柠檬.薄荷',
    '奶蓝.草莓', '奶蓝.芒果', '奶蓝.蓝莓', '奶蓝.抹茶', '奶蓝.薄荷', '奶蓝.葡萄',
    '青提.草莓', '青提.蓝莓', '青提.薄荷', '青提.葡萄',
    '海盐.草莓', '海盐.芒果', '海盐.抹茶', '海盐.葡萄',
    '芋泥.草莓', '芋泥.芒果', '芋泥.薄荷', '芋泥.葡萄',
    '薄荷.草莓', '薄荷.芒果', '薄荷.葡萄',
    '葡萄.草莓', '葡萄.芒果'
  ];

  var IMAGES_DIR = './assets/images/';

  // ============================================================
  // 状态变量
  // ============================================================

  var drawCount = 0;
  var isDrawing = false;
  var cards = [];
  var records = [];
  var currentFilters = [];
  var isLongPressRunning = false;
  var longPressTimer = null;

  // ============================================================
  // DOM 引用
  // ============================================================

  var drawBtn = document.getElementById('draw-btn');
  var longPressBtn = document.getElementById('long-press-btn');
  var statsLabel = document.getElementById('stats-label');
  var probBtn = document.getElementById('prob-btn');
  var filterLabel = document.getElementById('filter-label');
  var clearFilterBtn = document.getElementById('clear-filter-btn');
  var recordsContainer = document.getElementById('records-container');
  var probModal = document.getElementById('prob-modal');
  var closeModalBtn = document.getElementById('close-modal-btn');
  var gifImage = document.getElementById('gif-image');

  // ============================================================
  // 工具函数
  // ============================================================

  function weightedChoice(weights) {
    var items = Object.keys(weights);
    var probs = Object.keys(weights).map(function(k) { return weights[k]; });
    var total = 0;
    var i;
    for (i = 0; i < probs.length; i++) {
      total += probs[i];
    }
    var r = Math.random() * total;
    for (i = 0; i < probs.length; i++) {
      r -= probs[i];
      if (r <= 0) {
        return items[i];
      }
    }
    return items[items.length - 1];
  }

  function getImageFilename(colorCombination, particle) {
    if (particle) {
      return colorCombination + '.' + particle + '.炫彩.png';
    } else {
      return colorCombination + '.炫彩.png';
    }
  }

  function getImagePath(colorCombination, particle) {
    return IMAGES_DIR + getImageFilename(colorCombination, particle);
  }

  // ============================================================
  // GIF 动画控制
  // ============================================================

  var gifOriginalSrc = gifImage ? gifImage.src : '';

  function playGif() {
    if (gifImage && gifOriginalSrc) {
      // 重置GIF播放（通过重新设置src）
      gifImage.src = '';
      gifImage.src = gifOriginalSrc;
    }
  }

  // ============================================================
  // 抽卡逻辑
  // ============================================================

  function draw() {
    var result = {};
    var shinyRoll = Math.random();

    if (shinyRoll < 0.01) {
      result.shinyType = '黑白';
      result.colorCombination = '黑白';
      result.color1 = '黑白';
      result.color2 = '黑白';
      result.particle = null;
    } else {
      result.shinyType = '普通';
      result.colorCombination = NORMAL_COLORS[Math.floor(Math.random() * NORMAL_COLORS.length)];
      var colors = result.colorCombination.split('.');
      result.color1 = colors[0];
      result.color2 = colors[1];
      result.particle = weightedChoice(PARTICLE_PROB);
    }

    result.talent = weightedChoice(TALENTS);
    result.personality = PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];
    result.imageFilename = getImageFilename(result.colorCombination, result.particle);

    return result;
  }

  // ============================================================
  // 创建卡片
  // ============================================================

  function createCard(result, index) {
    var card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-index', index);

    // 图片区域
    var imageDiv = document.createElement('div');
    imageDiv.className = 'card-image';

    var imgPath = getImagePath(result.colorCombination, result.particle);
    var img = document.createElement('img');
    img.src = imgPath;
    img.alt = result.colorCombination;
    img.onerror = function() {
      // 图片加载失败时显示备用图标
      imageDiv.innerHTML = '';
      var icon = document.createElement('span');
      icon.className = 'fallback-icon';
      icon.textContent = PARTICLE_ICONS[result.particle] || '🎨';
      imageDiv.appendChild(icon);
    };
    imageDiv.appendChild(img);
    card.appendChild(imageDiv);

    // 颜色信息区域
    var colorsDiv = document.createElement('div');
    colorsDiv.className = 'card-colors';

    if (result.shinyType === '黑白') {
      var bwLabel = document.createElement('div');
      bwLabel.className = 'color-label bw';
      bwLabel.textContent = '黑白';
      bwLabel.setAttribute('data-filter-type', 'bw');
      bwLabel.setAttribute('data-filter-value', '黑白');
      colorsDiv.appendChild(bwLabel);
    } else {
      // 顶色
      var color1Label = document.createElement('div');
      color1Label.className = 'color-label';
      color1Label.textContent = '顶色: ' + result.color1;
      color1Label.setAttribute('data-filter-type', 'color1');
      color1Label.setAttribute('data-filter-value', result.color1);
      colorsDiv.appendChild(color1Label);

      // 底色
      var color2Label = document.createElement('div');
      color2Label.className = 'color-label';
      color2Label.textContent = '底色: ' + result.color2;
      color2Label.setAttribute('data-filter-type', 'color2');
      color2Label.setAttribute('data-filter-value', result.color2);
      colorsDiv.appendChild(color2Label);

      // 粒子
      if (result.particle) {
        var particleLabel = document.createElement('div');
        particleLabel.className = 'color-label';
        particleLabel.textContent = '粒子: ' + result.particle;
        particleLabel.setAttribute('data-filter-type', 'particle');
        particleLabel.setAttribute('data-filter-value', result.particle);
        colorsDiv.appendChild(particleLabel);
      }
    }

    card.appendChild(colorsDiv);

    // 标签行
    var tagsDiv = document.createElement('div');
    tagsDiv.className = 'card-tags';

    // 特长标签
    var talentClass = result.talent !== '无' ? 'tag tag-talent' : 'tag tag-talent-none';
    var talentTag = document.createElement('span');
    talentTag.className = talentClass;
    talentTag.textContent = result.talent;
    talentTag.setAttribute('data-filter-type', 'talent');
    talentTag.setAttribute('data-filter-value', result.talent);
    tagsDiv.appendChild(talentTag);

    // 性格标签
    var personalityTag = document.createElement('span');
    personalityTag.className = 'tag tag-personality';
    personalityTag.textContent = result.personality;
    personalityTag.setAttribute('data-filter-type', 'personality');
    personalityTag.setAttribute('data-filter-value', result.personality);
    tagsDiv.appendChild(personalityTag);

    card.appendChild(tagsDiv);

    // 绑定筛选点击事件
    var filterElements = card.querySelectorAll('[data-filter-type]');
    var i;
    for (i = 0; i < filterElements.length; i++) {
      filterElements[i].addEventListener('click', onFilterClick);
    }

    return card;
  }

  // ============================================================
  // 投球逻辑
  // ============================================================

  function onDraw(longPress) {
    if (isDrawing) {
      return;
    }
    isDrawing = true;

    drawBtn.disabled = true;
    drawBtn.textContent = '投球中...';

    // 播放GIF动画
    playGif();

    if (longPress) {
      // 长按模式下直接执行
      executeDraw();
    } else {
      // 延迟后显示结果
      setTimeout(executeDraw, 500);
    }
  }

  function executeDraw() {
    var result = draw();
    drawCount++;
    statsLabel.textContent = '投球次数: ' + drawCount;

    // 保存记录数据
    records.unshift(result);

    // 创建卡片
    var card = createCard(result, 0);
    cards.unshift(card);

    // 重新渲染
    if (currentFilters.length > 0) {
      applyFilters();
    } else {
      relayoutCards();
    }

    drawBtn.disabled = false;
    drawBtn.textContent = '🎯 投球！';
    isDrawing = false;
  }

  // ============================================================
  // 长按投球切换
  // ============================================================

  function onLongPressToggle() {
    if (isLongPressRunning) {
      // 停止连续投球
      isLongPressRunning = false;
      if (longPressTimer) {
        clearInterval(longPressTimer);
        longPressTimer = null;
      }
      longPressBtn.textContent = '⏱ 长按投球';
      longPressBtn.classList.remove('running');
    } else {
      // 开始连续投球
      isLongPressRunning = true;
      longPressBtn.textContent = '点击停止';
      longPressBtn.classList.add('running');

      // 立即执行一次投球（长按模式）
      onDraw(true);

      // 启动定时器，每1.5秒执行一次
      longPressTimer = setInterval(function() {
        onDraw(true);
      }, 1500);
    }
  }

  // ============================================================
  // 布局管理
  // ============================================================

  function relayoutCards() {
    recordsContainer.innerHTML = '';
    var i;
    for (i = 0; i < cards.length; i++) {
      recordsContainer.appendChild(cards[i]);
    }
  }

  // ============================================================
  // 筛选逻辑
  // ============================================================

  var TYPE_NAMES = {
    'bw': '黑白',
    'color1': '顶色',
    'color2': '底色',
    'particle': '粒子',
    'talent': '特长',
    'personality': '性格'
  };

  function onFilterClick(e) {
    var filterType = e.currentTarget.getAttribute('data-filter-type');
    var filterValue = e.currentTarget.getAttribute('data-filter-value');
    var newFilter = { type: filterType, value: filterValue };

    // 检查是否已存在相同条件
    var exists = false;
    var i;
    for (i = 0; i < currentFilters.length; i++) {
      if (currentFilters[i].type === filterType && currentFilters[i].value === filterValue) {
        currentFilters.splice(i, 1);
        exists = true;
        break;
      }
    }

    if (!exists) {
      currentFilters.push(newFilter);
    }

    applyFilters();
  }

  function applyFilters() {
    // 更新筛选标签显示
    if (currentFilters.length > 0) {
      var texts = [];
      var i;
      for (i = 0; i < currentFilters.length; i++) {
        var typeName = TYPE_NAMES[currentFilters[i].type] || currentFilters[i].type;
        texts.push(typeName + ': ' + currentFilters[i].value);
      }
      filterLabel.textContent = texts.join(' | ');
      filterLabel.classList.add('show');
      clearFilterBtn.classList.add('show');
    } else {
      filterLabel.classList.remove('show');
      clearFilterBtn.classList.remove('show');
    }

    // 获取匹配的卡片
    var matchedCards = [];
    var i, j;
    for (i = 0; i < records.length; i++) {
      var record = records[i];
      var match = true;

      for (j = 0; j < currentFilters.length; j++) {
        var ftype = currentFilters[j].type;
        var fvalue = currentFilters[j].value;

        if (ftype === 'bw') {
          if (record.shinyType !== '黑白') {
            match = false;
            break;
          }
        } else if (ftype === 'color1' && record.color1 !== fvalue) {
          match = false;
          break;
        } else if (ftype === 'color2' && record.color2 !== fvalue) {
          match = false;
          break;
        } else if (ftype === 'particle' && record.particle !== fvalue) {
          match = false;
          break;
        } else if (ftype === 'talent' && record.talent !== fvalue) {
          match = false;
          break;
        } else if (ftype === 'personality' && record.personality !== fvalue) {
          match = false;
          break;
        }
      }

      if (match) {
        matchedCards.push(cards[i]);
      }
    }

    // 重新渲染
    recordsContainer.innerHTML = '';
    for (i = 0; i < matchedCards.length; i++) {
      recordsContainer.appendChild(matchedCards[i]);
    }
  }

  function clearFilter() {
    currentFilters = [];
    filterLabel.classList.remove('show');
    clearFilterBtn.classList.remove('show');
    relayoutCards();
  }

  // ============================================================
  // 概率弹窗
  // ============================================================

  function showProbability() {
    probModal.classList.add('show');
  }

  function hideProbability() {
    probModal.classList.remove('show');
  }

  // ============================================================
  // 事件绑定
  // ============================================================

  drawBtn.addEventListener('click', function() {
    onDraw(false);
  });

  longPressBtn.addEventListener('click', onLongPressToggle);

  probBtn.addEventListener('click', showProbability);

  closeModalBtn.addEventListener('click', hideProbability);

  probModal.addEventListener('click', function(e) {
    if (e.target === probModal) {
      hideProbability();
    }
  });

  clearFilterBtn.addEventListener('click', clearFilter);

})();
