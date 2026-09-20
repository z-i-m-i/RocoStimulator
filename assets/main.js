(function () {
  'use strict';

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

  var drawCount = 0;
  var isDrawing = false;
  var cards = [];
  var records = [];
  var currentFilters = [];
  var isLongPressRunning = false;
  var longPressTimer = null;

  // 色卡信息显示状态：true = 显示，false = 隐藏
  var showCardInfo = false;

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
  var infoToggleBtn = document.getElementById('info-toggle-btn');
  var filterStatsRow = document.getElementById('filter-stats-row');
  var filterStatsLabel = document.getElementById('filter-stats-label');
  var filterStatsMessage = document.getElementById('filter-stats-message');

  var gifOriginalSrc = gifImage ? gifImage.src : '';

  function playGif() {
    if (gifImage && gifOriginalSrc) {
      gifImage.src = '';
      gifImage.src = gifOriginalSrc;
    }
  }

  function weightedChoice(weights) {
    var items = Object.keys(weights);
    var probs = [];
    var i;
    for (i = 0; i < items.length; i++) {
      probs.push(weights[items[i]]);
    }
    var total = 0;
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
    }
    return colorCombination + '.炫彩.png';
  }

  function getImagePath(colorCombination, particle) {
    return IMAGES_DIR + getImageFilename(colorCombination, particle);
  }

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

  function createCard(result, drawNumber) {
    var card = document.createElement('div');
    card.className = 'card';
    if (showCardInfo) {
      card.classList.add('show-info');
    }

    var imageDiv = document.createElement('div');
    imageDiv.className = 'card-image';

    var imgPath = getImagePath(result.colorCombination, result.particle);
    var img = document.createElement('img');
    img.src = imgPath;
    img.alt = result.colorCombination;
    img.onerror = function () {
      imageDiv.innerHTML = '';
      var icon = document.createElement('span');
      icon.className = 'fallback-icon';
      icon.textContent = PARTICLE_ICONS[result.particle] || '🎨';
      imageDiv.appendChild(icon);
    };
    imageDiv.appendChild(img);
    card.appendChild(imageDiv);

    // 色卡信息区域 - 始终添加筛选属性，显示/隐藏只控制视觉
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
      var color1Label = document.createElement('div');
      color1Label.className = 'color-label';
      color1Label.textContent = '顶色: ' + result.color1;
      color1Label.setAttribute('data-filter-type', 'color1');
      color1Label.setAttribute('data-filter-value', result.color1);
      colorsDiv.appendChild(color1Label);

      var color2Label = document.createElement('div');
      color2Label.className = 'color-label';
      color2Label.textContent = '底色: ' + result.color2;
      color2Label.setAttribute('data-filter-type', 'color2');
      color2Label.setAttribute('data-filter-value', result.color2);
      colorsDiv.appendChild(color2Label);

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

    // 标签区域（特长/性格），始终显示且始终可筛选
    var tagsDiv = document.createElement('div');
    tagsDiv.className = 'card-tags';

    // 添加投球序号
    if (drawNumber) {
      var indexSpan = document.createElement('span');
      indexSpan.className = 'tag-index';
      indexSpan.textContent = drawNumber;
      tagsDiv.appendChild(indexSpan);
    }

    var talentClass = result.talent !== '无' ? 'tag tag-talent' : 'tag tag-talent-none';
    var talentTag = document.createElement('span');
    talentTag.className = talentClass;
    talentTag.textContent = result.talent;
    talentTag.setAttribute('data-filter-type', 'talent');
    talentTag.setAttribute('data-filter-value', result.talent);
    tagsDiv.appendChild(talentTag);

    var personalityTag = document.createElement('span');
    personalityTag.className = 'tag tag-personality';
    personalityTag.textContent = result.personality;
    personalityTag.setAttribute('data-filter-type', 'personality');
    personalityTag.setAttribute('data-filter-value', result.personality);
    tagsDiv.appendChild(personalityTag);

    card.appendChild(tagsDiv);

    var filterElements = card.querySelectorAll('[data-filter-type]');
    for (var i = 0; i < filterElements.length; i++) {
      filterElements[i].addEventListener('click', onLabelClick);
    }

    // 为色卡图片添加上下区域点击筛选
    if (result.shinyType === '黑白') {
      // 黑白卡：点击图片区域任意位置均触发bw筛选
      imageDiv.addEventListener('click', function (e) {
        if (isFilterTarget(e)) return;
        onCardAreaClick('bw', '黑白');
      });
      colorsDiv.addEventListener('click', function (e) {
        if (isFilterTarget(e)) return;
        onCardAreaClick('bw', '黑白');
      });
    } else {
      // 彩色卡：点击图片上半部分=顶色，下半部分=底色
      imageDiv.addEventListener('click', function (e) {
        if (isFilterTarget(e)) return;
        var rect = imageDiv.getBoundingClientRect();
        var clickY = e.clientY - rect.top;
        var halfHeight = rect.height / 2;
        if (clickY < halfHeight) {
          // 上半部分 → 顶色
          onCardAreaClick('color1', result.color1);
        } else {
          // 下半部分 → 底色
          onCardAreaClick('color2', result.color2);
        }
      });
      colorsDiv.addEventListener('click', function (e) {
        if (isFilterTarget(e)) return;
        onCardAreaClick('color2', result.color2);
      });
    }

    return card;
  }

  function isFilterTarget(e) {
    // 如果点击目标本身是data-filter-type标签，则让标签自己的处理逻辑接管
    var target = e.target;
    while (target) {
      if (target.getAttribute && target.getAttribute('data-filter-type')) {
        return true;
      }
      if (target.parentNode) {
        target = target.parentNode;
      } else {
        break;
      }
    }
    return false;
  }

  function onLabelClick(e) {
    e.stopPropagation();
    e.preventDefault();
    onFilterClick.call(this, e);
  }

  function onCardAreaClick(filterType, filterValue) {
    var exists = false;
    for (var i = 0; i < currentFilters.length; i++) {
      if (currentFilters[i].type === filterType && currentFilters[i].value === filterValue) {
        currentFilters.splice(i, 1);
        exists = true;
        break;
      }
    }
    if (!exists) {
      currentFilters.push({ type: filterType, value: filterValue });
    }
    applyFilters();
  }

  function updateAllCardsInfoDisplay() {
    for (var i = 0; i < cards.length; i++) {
      if (showCardInfo) {
        cards[i].classList.add('show-info');
      } else {
        cards[i].classList.remove('show-info');
      }
    }
  }

  function onInfoToggle() {
    showCardInfo = !showCardInfo;

    if (showCardInfo) {
      infoToggleBtn.textContent = '🎨 隐藏色卡信息';
      infoToggleBtn.classList.add('active');
    } else {
      infoToggleBtn.textContent = '🎨 显示色卡信息';
      infoToggleBtn.classList.remove('active');
    }

    updateAllCardsInfoDisplay();

    // 筛选条件可能涉及色卡信息，重新应用筛选
    if (currentFilters.length > 0) {
      applyFilters();
    }
  }

  function onDraw(longPress) {
    if (isDrawing) return;
    isDrawing = true;

    drawBtn.disabled = true;
    drawBtn.textContent = '投球中...';

    playGif();

    if (longPress) {
      executeDraw();
    } else {
      setTimeout(executeDraw, 500);
    }
  }

  function executeDraw() {
    var result = draw();
    drawCount++;
    statsLabel.textContent = '投球次数: ' + drawCount;

    records.unshift(result);

    var card = createCard(result, drawCount);
    cards.unshift(card);

    if (currentFilters.length > 0) {
      applyFilters();
    } else {
      relayoutCards();
    }

    drawBtn.disabled = false;
    drawBtn.textContent = '🎯 投球！';
    isDrawing = false;
  }

  function onLongPressToggle() {
    if (isLongPressRunning) {
      isLongPressRunning = false;
      if (longPressTimer) {
        clearInterval(longPressTimer);
        longPressTimer = null;
      }
      longPressBtn.textContent = '⏱ 长按投球';
      longPressBtn.classList.remove('running');
    } else {
      isLongPressRunning = true;
      longPressBtn.textContent = '点击停止';
      longPressBtn.classList.add('running');

      onDraw(true);

      longPressTimer = setInterval(function () {
        onDraw(true);
      }, 1500);
    }
  }

  function relayoutCards() {
    recordsContainer.innerHTML = '';
    for (var i = 0; i < cards.length; i++) {
      recordsContainer.appendChild(cards[i]);
    }
  }

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

    var exists = false;
    for (var i = 0; i < currentFilters.length; i++) {
      if (currentFilters[i].type === filterType && currentFilters[i].value === filterValue) {
        currentFilters.splice(i, 1);
        exists = true;
        break;
      }
    }

    if (!exists) {
      currentFilters.push({ type: filterType, value: filterValue });
    }

    applyFilters();
  }

  function applyFilters() {
    if (currentFilters.length > 0) {
      var texts = [];
      for (var i = 0; i < currentFilters.length; i++) {
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

    var matchedCards = [];
    for (var i = 0; i < records.length; i++) {
      var record = records[i];
      var match = true;

      for (var j = 0; j < currentFilters.length; j++) {
        var ftype = currentFilters[j].type;
        var fvalue = currentFilters[j].value;

        if (ftype === 'bw') {
          if (record.shinyType !== '黑白') { match = false; break; }
        } else if (ftype === 'color1' && record.color1 !== fvalue) {
          match = false; break;
        } else if (ftype === 'color2' && record.color2 !== fvalue) {
          match = false; break;
        } else if (ftype === 'particle' && record.particle !== fvalue) {
          match = false; break;
        } else if (ftype === 'talent' && record.talent !== fvalue) {
          match = false; break;
        } else if (ftype === 'personality' && record.personality !== fvalue) {
          match = false; break;
        }
      }

      if (match) {
        matchedCards.push(cards[i]);
      }
    }

    recordsContainer.innerHTML = '';
    for (var k = 0; k < matchedCards.length; k++) {
      recordsContainer.appendChild(matchedCards[k]);
    }

    updateFilterStats(matchedCards.length, records.length);
  }

  function updateFilterStats(matchedCount, totalCount) {
    if (currentFilters.length === 0) {
      filterStatsRow.classList.remove('active');
      return;
    }

    filterStatsRow.classList.add('active');

    var percentage = totalCount > 0 ? (matchedCount / totalCount * 100) : 0;
    filterStatsLabel.textContent = '投球次数: ' + totalCount + '，计数：' + matchedCount + '，占比：' + percentage.toFixed(1) + '%';

    // 黑白概率特殊判断
    if (currentFilters.length === 1 && currentFilters[0].type === 'bw') {
      if (percentage > 1) {
        filterStatsMessage.textContent = '！？欧欧？！';
      } else if (percentage < 1) {
        filterStatsMessage.textContent = '！？非非？！';
      } else {
        filterStatsMessage.textContent = '？！刚刚好？！';
      }
      filterStatsMessage.classList.add('active');
    } else {
      filterStatsMessage.textContent = '';
      filterStatsMessage.classList.remove('active');
    }
  }

  function clearFilter() {
    currentFilters = [];
    filterLabel.classList.remove('show');
    clearFilterBtn.classList.remove('show');
    filterStatsRow.classList.remove('active');
    filterStatsMessage.classList.remove('active');
    relayoutCards();
  }

  function showProbability() {
    probModal.classList.add('show');
  }

  function hideProbability() {
    probModal.classList.remove('show');
  }

  drawBtn.addEventListener('click', function () { onDraw(false); });
  longPressBtn.addEventListener('click', onLongPressToggle);
  probBtn.addEventListener('click', showProbability);
  closeModalBtn.addEventListener('click', hideProbability);
  infoToggleBtn.addEventListener('click', onInfoToggle);

  probModal.addEventListener('click', function (e) {
    if (e.target === probModal) hideProbability();
  });

  clearFilterBtn.addEventListener('click', clearFilter);

})();
