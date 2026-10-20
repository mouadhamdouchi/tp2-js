const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// 01 · Changement de style
const colorDemo = $("#colorDemo");
const colorButton = $("#colorButton");
const colorThemes = [
  { background: "#ebf0e5", color: "#556844" },
  { background: "#e9e9f4", color: "#575b82" },
  { background: "#f5e9df", color: "#8a6043" },
  { background: "#e1f0ed", color: "#44736a" },
  { background: "#f3e8ee", color: "#865a72" },
];
let colorIndex = 0;
colorButton.addEventListener("click", () => {
  colorIndex = (colorIndex + 1) % colorThemes.length;
  const theme = colorThemes[colorIndex];
  colorDemo.style.backgroundColor = theme.background;
  colorDemo.style.color = theme.color;
});

// 02 · Afficher et masquer un paragraphe
const toggleText = $("#toggleText");
const toggleTextButton = $("#toggleTextButton");
toggleTextButton.addEventListener("click", () => {
  const willHide = !toggleText.hidden;
  toggleText.hidden = willHide;
  toggleTextButton.setAttribute("aria-expanded", String(!willHide));
  toggleTextButton.innerHTML = willHide ? 'Afficher le texte <span>⌄</span>' : 'Masquer le texte <span>⌃</span>';
});

// 03 · Validation du formulaire
const contactForm = $("#contactForm");
const formMessage = $("#formMessage");
contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = $("#nameInput").value.trim();
  const email = $("#emailInput").value.trim();
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!name || !email) {
    formMessage.textContent = "Remplis les deux champs pour continuer.";
    formMessage.classList.add("error");
    (!name ? $("#nameInput") : $("#emailInput")).focus();
    return;
  }
  if (!emailIsValid) {
    formMessage.textContent = "Cette adresse e-mail ne semble pas valide.";
    formMessage.classList.add("error");
    $("#emailInput").focus();
    return;
  }
  formMessage.textContent = `Merci ${name} ! Les champs sont valides.`;
  formMessage.classList.remove("error");
});
contactForm.addEventListener("input", () => {
  if (formMessage.textContent) {
    formMessage.textContent = "";
    formMessage.classList.remove("error");
  }
});

// 04 · Opérations rapides et calculatrice complète
const quickResult = $("#quickResult");
const arithmetic = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => a / b,
};
const formatNumber = (value) => {
  if (!Number.isFinite(value)) return "Erreur";
  return String(Number(value.toPrecision(10)));
};

$$('[data-operation]').forEach((button) => {
  button.addEventListener("click", () => {
    const firstRaw = $("#firstNumber").value;
    const secondRaw = $("#secondNumber").value;
    if (firstRaw === "" || secondRaw === "") {
      quickResult.textContent = "Saisis les deux nombres pour calculer.";
      return;
    }
    const first = Number(firstRaw);
    const second = Number(secondRaw);
    if (!Number.isFinite(first) || !Number.isFinite(second)) {
      quickResult.textContent = "Saisis deux nombres valides.";
      return;
    }
    if (button.dataset.operation === "divide" && second === 0) {
      quickResult.textContent = "La division par zéro est impossible.";
      return;
    }
    quickResult.textContent = `Résultat : ${formatNumber(arithmetic[button.dataset.operation](first, second))}`;
  });
});

const calcDisplay = $("#calcDisplay");
const calcExpression = $("#calcExpression");
let calcCurrent = "0";
let calcPrevious = null;
let calcOperator = null;
let calcWaitingForNumber = false;
const operatorSymbols = { add: "+", subtract: "−", multiply: "×", divide: "÷" };
const updateCalculator = () => { calcDisplay.textContent = calcCurrent; };

function clearCalculator() {
  calcCurrent = "0";
  calcPrevious = null;
  calcOperator = null;
  calcWaitingForNumber = false;
  calcExpression.textContent = "";
  updateCalculator();
}

function enterDigit(digit) {
  if (calcWaitingForNumber || calcCurrent === "Erreur") {
    calcCurrent = digit;
    calcWaitingForNumber = false;
  } else if (calcCurrent.replace(/[^0-9]/g, "").length < 14) {
    calcCurrent = calcCurrent === "0" ? digit : calcCurrent + digit;
  }
  updateCalculator();
}

function enterDecimal() {
  if (calcWaitingForNumber || calcCurrent === "Erreur") {
    calcCurrent = "0.";
    calcWaitingForNumber = false;
  } else if (!calcCurrent.includes(".")) {
    calcCurrent += ".";
  }
  updateCalculator();
}

function calculate(left, right, operator) {
  if (operator === "add") return left + right;
  if (operator === "subtract") return left - right;
  if (operator === "multiply") return left * right;
  if (operator === "divide") return right === 0 ? null : left / right;
  return right;
}

function chooseOperator(nextOperator) {
  if (calcCurrent === "Erreur") clearCalculator();
  const inputValue = Number(calcCurrent);
  if (!Number.isFinite(inputValue)) return;

  if (calcOperator && calcPrevious !== null && !calcWaitingForNumber) {
    const result = calculate(calcPrevious, inputValue, calcOperator);
    if (result === null || !Number.isFinite(result)) {
      calcCurrent = "Erreur";
      calcPrevious = null;
      calcOperator = null;
      calcExpression.textContent = "Division par zéro";
      calcWaitingForNumber = true;
      updateCalculator();
      return;
    }
    calcCurrent = formatNumber(result);
  }

  calcPrevious = Number(calcCurrent);
  calcOperator = nextOperator;
  calcWaitingForNumber = true;
  calcExpression.textContent = `${formatNumber(calcPrevious)} ${operatorSymbols[calcOperator]}`;
  updateCalculator();
}

function getCalculatorResult() {
  if (!calcOperator || calcPrevious === null || calcCurrent === "Erreur") return;
  const right = Number(calcCurrent);
  const result = calculate(calcPrevious, right, calcOperator);
  if (result === null || !Number.isFinite(result)) {
    calcExpression.textContent = "Division par zéro";
    calcCurrent = "Erreur";
  } else {
    calcExpression.textContent = `${formatNumber(calcPrevious)} ${operatorSymbols[calcOperator]} ${formatNumber(right)} =`;
    calcCurrent = formatNumber(result);
  }
  calcPrevious = null;
  calcOperator = null;
  calcWaitingForNumber = true;
  updateCalculator();
}

$(".calculator-keys").addEventListener("click", (event) => {
  const key = event.target.closest("button");
  if (!key) return;
  if (key.dataset.digit !== undefined) enterDigit(key.dataset.digit);
  else if (key.dataset.key === "decimal") enterDecimal();
  else if (key.dataset.key === "clear") clearCalculator();
  else if (key.dataset.key === "backspace") {
    if (calcWaitingForNumber || calcCurrent === "Erreur") {
      calcCurrent = "0";
      calcWaitingForNumber = false;
    } else {
      calcCurrent = calcCurrent.length > 1 ? calcCurrent.slice(0, -1) : "0";
      if (calcCurrent === "-") calcCurrent = "0";
    }
    updateCalculator();
  } else if (key.dataset.key === "equals") getCalculatorResult();
  else if (arithmetic[key.dataset.key]) chooseOperator(key.dataset.key);
});

// 05 · Carrousel photo
const photos = [
  { src: "assets/images/lake.jpg", title: "Au bord du lac", alt: "Lac alpin entouré de montagnes" },
  { src: "assets/images/ocean.jpg", title: "L’appel du large", alt: "Plage de sable au bord de l’océan" },
  { src: "assets/images/mountain.jpg", title: "Le sentier vert", alt: "Forêt et montagnes qui se reflètent dans un lac" },
  { src: "assets/images/coast.jpg", title: "La côte bleue", alt: "Vagues bleues le long de la côte" },
];
let photoIndex = 0;
const carouselImage = $("#carouselImage");
const carouselTitle = $("#carouselTitle");
const carouselCounter = $("#carouselCounter");
const carouselDots = $("#carouselDots");

photos.forEach((photo, index) => {
  const dot = document.createElement("button");
  dot.type = "button";
  dot.setAttribute("aria-label", `Afficher la photo ${index + 1} : ${photo.title}`);
  dot.addEventListener("click", () => showPhoto(index));
  carouselDots.append(dot);
});

function showPhoto(index) {
  photoIndex = (index + photos.length) % photos.length;
  const photo = photos[photoIndex];
  carouselImage.src = photo.src;
  carouselImage.alt = photo.alt;
  carouselTitle.textContent = photo.title;
  carouselCounter.innerHTML = `${String(photoIndex + 1).padStart(2, "0")} <i>/</i> ${String(photos.length).padStart(2, "0")}`;
  $$("button", carouselDots).forEach((dot, dotIndex) => {
    dot.classList.toggle("active", dotIndex === photoIndex);
    dot.setAttribute("aria-current", String(dotIndex === photoIndex));
  });
}

$("#previousPhoto").addEventListener("click", () => showPhoto(photoIndex - 1));
$("#nextPhoto").addEventListener("click", () => showPhoto(photoIndex + 1));
showPhoto(0);

// 06 · Menu déroulant animé
const dropdownTrigger = $("#dropdownTrigger");
const dropdownMenu = $("#dropdownMenu");
function closeDropdown() {
  dropdownMenu.hidden = true;
  dropdownTrigger.setAttribute("aria-expanded", "false");
}
dropdownTrigger.addEventListener("click", () => {
  const isOpening = dropdownMenu.hidden;
  dropdownMenu.hidden = !isOpening;
  dropdownTrigger.setAttribute("aria-expanded", String(isOpening));
});
dropdownMenu.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeDropdown();
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".dropdown-wrap")) closeDropdown();
});

// 07 · Chronomètre en temps réel
const timerStartedAt = Date.now();
function updateElapsedTime() {
  const totalSeconds = Math.floor((Date.now() - timerStartedAt) / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  $("#elapsedTime").textContent = `${minutes}:${seconds}`;
}
updateElapsedTime();
window.setInterval(updateElapsedTime, 1000);

// 08 · Événements de souris et de focus
const hoverZone = $("#hoverZone");
const hoverText = $("#hoverText");
function setHoverState(isActive) {
  hoverZone.classList.toggle("is-hovered", isActive);
  hoverText.textContent = isActive ? "Bien joué !" : "Passe par ici";
}
hoverZone.addEventListener("pointerenter", () => setHoverState(true));
hoverZone.addEventListener("pointerleave", () => setHoverState(false));
hoverZone.addEventListener("focus", () => setHoverState(true));
hoverZone.addEventListener("blur", () => setHoverState(false));

// 09 · To-do list
const tasks = [];
const todoForm = $("#todoForm");
const todoInput = $("#todoInput");
const todoList = $("#todoList");
const todoCount = $("#todoCount");

function renderTasks() {
  todoList.replaceChildren();
  if (tasks.length === 0) {
    const empty = document.createElement("li");
    empty.className = "todo-empty";
    empty.textContent = "Aucune tâche pour le moment — ajoute-en une !";
    todoList.append(empty);
  }

  tasks.forEach((task) => {
    const row = document.createElement("li");
    row.className = `todo-item${task.done ? " done" : ""}`;
    const check = document.createElement("button");
    check.className = "todo-check";
    check.type = "button";
    check.textContent = "✓";
    check.setAttribute("aria-label", task.done ? "Marquer comme à faire" : "Marquer comme terminée");
    check.setAttribute("aria-pressed", String(task.done));
    check.addEventListener("click", () => {
      task.done = !task.done;
      renderTasks();
    });
    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = task.label;
    const remove = document.createElement("button");
    remove.className = "todo-delete";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Supprimer la tâche : ${task.label}`);
    remove.addEventListener("click", () => {
      tasks.splice(tasks.indexOf(task), 1);
      renderTasks();
    });
    row.append(check, text, remove);
    todoList.append(row);
  });

  const remaining = tasks.filter((task) => !task.done).length;
  todoCount.textContent = `${remaining} tâche${remaining === 1 ? "" : "s"} restante${remaining === 1 ? "" : "s"}`;
}

todoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const label = todoInput.value.trim();
  if (!label) {
    todoInput.focus();
    return;
  }
  tasks.push({ id: Date.now(), label, done: false });
  todoInput.value = "";
  renderTasks();
  todoInput.focus();
});
$("#clearDone").addEventListener("click", () => {
  for (let index = tasks.length - 1; index >= 0; index -= 1) {
    if (tasks[index].done) tasks.splice(index, 1);
  }
  renderTasks();
});
renderTasks();

// 10 · Modale de notification
const modalBackdrop = $("#modalBackdrop");
const openModalButton = $("#openModal");
const closeModalButton = $("#closeModal");
let modalOpener = null;
function openNotification() {
  modalOpener = document.activeElement;
  modalBackdrop.hidden = false;
  document.body.style.overflow = "hidden";
  closeModalButton.focus();
}
function closeNotification() {
  modalBackdrop.hidden = true;
  document.body.style.overflow = "";
  modalOpener?.focus();
}
openModalButton.addEventListener("click", openNotification);
closeModalButton.addEventListener("click", closeNotification);
$("#modalOk").addEventListener("click", closeNotification);
modalBackdrop.addEventListener("click", (event) => {
  if (event.target === modalBackdrop) closeNotification();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modalBackdrop.hidden) closeNotification();
});

// 11 · Filtrage de destinations
const filterInput = $("#filterInput");
const destinationItems = $$(".destination-item");
const filterTotal = $("#filterTotal");
const filterEmpty = $("#filterEmpty");
const normalizeText = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
filterInput.addEventListener("input", () => {
  const query = normalizeText(filterInput.value.trim());
  let visibleCount = 0;
  destinationItems.forEach((item) => {
    const matches = normalizeText(`${item.dataset.search} ${item.textContent}`).includes(query);
    item.hidden = !matches;
    if (matches) visibleCount += 1;
  });
  filterTotal.textContent = String(visibleCount).padStart(2, "0");
  filterEmpty.hidden = visibleCount !== 0;
});

// 12 · Réponse au redimensionnement
const viewportWidth = $("#viewportWidth");
const layoutMessage = $("#layoutMessage");
const responsiveDetail = $("#responsiveDetail");
function updateResponsiveLayout() {
  const isCompact = window.innerWidth <= 760;
  document.body.classList.toggle("layout-compact", isCompact);
  viewportWidth.textContent = `${window.innerWidth} px`;
  layoutMessage.textContent = isCompact ? "Format compact détecté" : "Format large détecté";
  responsiveDetail.textContent = isCompact
    ? "Écran étroit : le mode compact est activé."
    : "Sur un écran étroit, l’affichage passe automatiquement en mode compact.";
}
window.addEventListener("resize", updateResponsiveLayout, { passive: true });
updateResponsiveLayout();

// 13 · Barre de progression
let progress = 0;
const progressBar = $("#progressBar");
const progressValue = $("#progressValue");
const progressTrack = $("#progressTrack");
const progressButton = $("#progressButton");
progressButton.addEventListener("click", () => {
  progress = progress >= 100 ? 0 : Math.min(100, progress + 10);
  progressBar.style.width = `${progress}%`;
  progressValue.textContent = `${progress}%`;
  progressTrack.setAttribute("aria-valuenow", String(progress));
  progressButton.innerHTML = progress === 100 ? 'C’est terminé ! Recommencer <span>↻</span>' : 'Avancer de 10 % <span>→</span>';
});

// 14 · Glisser-déposer
const dragSource = $("#dragSource");
const dropZone = $("#dropZone");
const dropCount = $("#dropCount");
const dropFeedback = $("#dropFeedback");
let selectedShapeId = null;
let activeDraggedId = null;

function placeShape(shapeId) {
  const shape = $(`[data-shape="${shapeId}"]`);
  if (!shape || shape.parentElement !== dragSource) return;
  shape.classList.remove("is-dragging");
  shape.classList.add("dropped-shape");
  shape.setAttribute("aria-pressed", "false");
  dropZone.append(shape);
  dropZone.classList.add("has-items");
  selectedShapeId = null;
  const placed = $$(".dropped-shape", dropZone).length;
  dropCount.textContent = String(placed);
  dropFeedback.textContent = placed === 3 ? "Toutes les formes ont trouvé leur place !" : `${3 - placed} forme${3 - placed === 1 ? "" : "s"} à déplacer.`;
}

dragSource.addEventListener("dragstart", (event) => {
  const shape = event.target.closest("[data-shape]");
  if (!shape) return;
  activeDraggedId = shape.dataset.shape;
  event.dataTransfer.setData("text/plain", activeDraggedId);
  event.dataTransfer.effectAllowed = "move";
  shape.classList.add("is-dragging");
});
dragSource.addEventListener("dragend", (event) => event.target.closest("[data-shape]")?.classList.remove("is-dragging"));
dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropZone.classList.add("is-over");
});
dropZone.addEventListener("dragleave", (event) => {
  if (!dropZone.contains(event.relatedTarget)) dropZone.classList.remove("is-over");
});
dropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropZone.classList.remove("is-over");
  const shapeId = event.dataTransfer.getData("text/plain") || activeDraggedId;
  if (shapeId) placeShape(shapeId);
  activeDraggedId = null;
});
document.addEventListener("keydown", (event) => {
  const shape = event.target.closest?.(".drag-chip");
  if (shape && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    if (shape.parentElement === dragSource) {
      selectedShapeId = shape.dataset.shape;
      $$(".drag-chip", dragSource).forEach((chip) => chip.setAttribute("aria-pressed", String(chip === shape)));
      dropFeedback.textContent = `Forme ${selectedShapeId} sélectionnée. Appuie sur Entrée dans la zone de dépôt.`;
      dropZone.focus();
    }
    return;
  }
  if (event.target === dropZone && selectedShapeId && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    placeShape(selectedShapeId);
  }
});

// 15 · Thème clair / sombre mémorisé dans le navigateur
const themeButtons = [$("#themeToggle"), $("#themeToggleCard")];
const themeLabel = $("#themeLabel");
function setDarkTheme(isDark, savePreference = true) {
  document.body.classList.toggle("dark-mode", isDark);
  themeButtons[0].setAttribute("aria-pressed", String(isDark));
  themeButtons[0].setAttribute("aria-label", isDark ? "Activer le thème clair" : "Activer le thème sombre");
  themeLabel.textContent = isDark ? "Thème sombre" : "Thème clair";
  themeButtons[1].setAttribute("aria-label", isDark ? "Activer le thème clair" : "Activer le thème sombre");
  themeButtons[1].setAttribute("aria-pressed", String(isDark));
  if (savePreference) {
    try { localStorage.setItem("atelier-js-theme", isDark ? "dark" : "light"); } catch { /* Stockage désactivé : le thème reste actif pour cette visite. */ }
  }
}

let savedTheme = "light";
try { savedTheme = localStorage.getItem("atelier-js-theme") || "light"; } catch { /* Le site reste utilisable sans stockage local. */ }
setDarkTheme(savedTheme === "dark", false);
themeButtons.forEach((button) => button.addEventListener("click", () => {
  setDarkTheme(!document.body.classList.contains("dark-mode"));
}));
