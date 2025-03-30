/* Обробка перемикання вкладок */
document.querySelectorAll('.tab-links a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = link.getAttribute('href');
    document.querySelectorAll('.tab-links li').forEach(li => li.classList.remove('active'));
    document.querySelectorAll('.tab-content .tab').forEach(tab => tab.classList.remove('active'));
    link.parentElement.classList.add('active');
    document.querySelector(target).classList.add('active');
  });
});

// Єдиний клас стеку з двома методами додавання/видалення
class CombinedStack {
  constructor() {
    this.items = [];
    this.pointer = 0;
  }
  // Методи для режиму "Масив"
  pushArray(element) {
    this.items.push(element);
    this.pointer = this.items.length;
  }
  popArray() {
    if (this.isEmpty()) return null;
    const el = this.items.pop();
    this.pointer = this.items.length;
    return el;
  }
  // Методи для режиму "Покажчик"
  pushPointer(element) {
    this.items[this.pointer] = element;
    this.pointer++;
  }
  popPointer() {
    if (this.pointer === 0) return null;
    this.pointer--;
    return this.items[this.pointer];
  }
  isEmpty() {
    return this.pointer === 0;
  }
  getItems() {
    return this.items.slice(0, this.pointer);
  }
}

// Функція оновлення відображення списку та середнього балу групи
function updateDisplay(container, stackItems) {
  const listEl = container.querySelector('.student-list');
  listEl.innerHTML = "";
  let total = 0;
  stackItems.forEach(student => {
    const li = document.createElement('li');
    li.textContent = `${student.name} - ${student.score}`;
    listEl.appendChild(li);
    total += student.score;
  });
  const averageEl = container.querySelector('.group-average span');
  averageEl.textContent = stackItems.length ? (total / stackItems.length).toFixed(2) : 0;
}

// Функція генерації випадкового числа у діапазоні [min, max]
function getRandomScore(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

// Створення об’єкта CombinedStack для кожної групи та попереднє заповнення 3-ма студентами
const groupsData = [];
document.querySelectorAll('.list-container').forEach((group, index) => {
  const stack = new CombinedStack();
  const nameInput = group.querySelector('.student-name');
  const scoreInput = group.querySelector('.student-score');
  const addBtn = group.querySelector('.add-btn');
  const removeBtn = group.querySelector('.remove-btn');

  // Отримання вибраного режиму роботи для групи
  function getSelectedMode() {
    const radios = group.querySelectorAll('.mode-selection input[type="radio"]');
    for (const radio of radios) {
      if (radio.checked) return radio.value;
    }
    return "array";
  }

  // Попереднє заповнення: додаємо 3 випадкових студентів
  for (let i = 1; i <= 3; i++) {
    const randomScore = getRandomScore(68, 93);
    // Ім'я студента: "Student X" де X - номер студента в групі
    stack.pushArray({ name: `Student ${i}`, score: randomScore });
  }
  updateDisplay(group, stack.getItems());

  // Додавання студента згідно з вибраним методом
  addBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    const score = parseFloat(scoreInput.value);
    if (!name || isNaN(score)) {
      alert("Будь ласка, введіть ім'я студента та числове значення балу.");
      return;
    }
    const mode = getSelectedMode();
    if (mode === "array") {
      stack.pushArray({ name, score });
    } else {
      stack.pushPointer({ name, score });
    }
    updateDisplay(group, stack.getItems());
    nameInput.value = "";
    scoreInput.value = "";
  });

  // Видалення студента згідно з вибраним методом
  removeBtn.addEventListener('click', () => {
    const mode = getSelectedMode();
    if (stack.isEmpty()) {
      alert("Список порожній!");
      return;
    }
    if (mode === "array") {
      stack.popArray();
    } else {
      stack.popPointer();
    }
    updateDisplay(group, stack.getItems());
  });

  // При зміні режиму оновлюємо відображення (дані зберігаються спільно)
  group.querySelectorAll('.mode-selection input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
      updateDisplay(group, stack.getItems());
    });
  });

  groupsData.push({
    container: group,
    getStack: () => stack.getItems()
  });
});

// Єдиний аналіз успішності груп (для обох методів)
document.getElementById('analyze-btn').addEventListener('click', () => {
  const groupAverages = [];
  groupsData.forEach(groupData => {
    const stackItems = groupData.getStack();
    let total = 0;
    stackItems.forEach(student => { total += student.score; });
    const avg = stackItems.length ? (total / stackItems.length) : 0;
    groupAverages.push(avg);
  });

  // Аналіз: для кожної підпослідовності з 3 груп визначаємо середнє та тенденцію,
  // форматуючи значення з 2 знаками після коми.
  const tempStack = new CombinedStack();
  groupAverages.forEach(score => tempStack.pushArray(score));
  const processed = [];
  while (!tempStack.isEmpty()) {
    processed.push(tempStack.popArray());
  }
  processed.reverse();

  let analysisText = "";
  for (let i = 0; i < processed.length - 2; i++) {
    const three = processed.slice(i, i + 3);
    const avgThree = three.reduce((sum, val) => sum + val, 0) / three.length;
    let trend = "Нестабільна";
    if (three[0] < three[1] && three[1] < three[2]) {
      trend = "Покращення";
    } else if (three[0] > three[1] && three[1] > three[2]) {
      trend = "Погіршення";
    }
    // Форматуємо значення з 2 знаками після коми
    const threeFormatted = three.map(num => num.toFixed(2)).join(', ');
    analysisText += `<p>Групи ${i+1}-${i+3}: [${threeFormatted}] | Середнє: ${avgThree.toFixed(2)} | Тенденція: ${trend}</p>`;
  }
  document.getElementById('analysis-results').innerHTML = analysisText;
});