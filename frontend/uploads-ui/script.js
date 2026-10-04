const fileInput = document.getElementById("documents");
const fileList = document.getElementById("fileList");
const saveButton = document.getElementById("saveButton");
const spinner = document.getElementById("spinner");
const buttonText = document.getElementById("buttonText");
const clearButton = document.getElementById("clearButton");
const uploadBox = document.querySelector(".upload-box");
const messageOverlay = document.getElementById("messageOverlay");
const messageModal = document.getElementById("messageModal");
const messageIcon = document.getElementById("messageIcon");
const messageText = document.getElementById("messageText");
const closeMessage = document.getElementById("closeMessage");
const askButton = document.getElementById("askButton");
const questionInput = document.getElementById("questionInput");
const answerText = document.getElementById("answerText");

let messageTimeout;

function showMessage(text, type = "error") {
    messageText.textContent = text;

    messageModal.className =
        type === "success" ? "success-modal" : "error-modal";

    messageIcon.textContent =
        type === "success" ? "✓" : "✕";

    messageOverlay.classList.add("show");
}

let selectedFiles = [];
let uploadedFiles = [];

const selectedTitle = document.getElementById("selectedTitle");

function formatFileSize(bytes) {
    if (bytes < 1024) {
        return bytes + " B";
    }

    if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + " KB";
    }

    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

uploadBox.addEventListener("dragover", function(e) {
    e.preventDefault();
    uploadBox.classList.add("dragging");
});


uploadBox.addEventListener("dragleave", function() {
    uploadBox.classList.remove("dragging");
});


uploadBox.addEventListener("drop", function(e) {
    e.preventDefault();

    uploadBox.classList.remove("dragging");

    const files = e.dataTransfer.files;

    for (let file of files) {

        const allowedTypes = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain"
        ];

        if (!allowedTypes.includes(file.type)) {
            showMessage(`${file.name} is not a supported file type`, "error");
            continue;
        }


        const alreadyExists = selectedFiles.some(
            f => f.name === file.name && f.size === file.size
        );


        if (!alreadyExists) {
            selectedFiles.push(file);
        }
    }


    if (selectedFiles.length > 0) {
        fileList.classList.add("has-files");
    }

    renderFiles();
});

fileInput.addEventListener("change", function () {

    const files = fileInput.files;

    for (let file of files) {
        const allowedTypes = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain"
        ];

    if (!allowedTypes.includes(file.type)) {
        showMessage(
        `${file.name} is not a supported file type.`,
        "error"
    );
    continue;
    }

    const alreadyExists = selectedFiles.some(
        f => f.name === file.name && f.size === file.size
    );

    if (!alreadyExists) {
        selectedFiles.push(file);
    }

    }

    if (selectedFiles.length > 0) {
        fileList.classList.add("has-files");
    }

    renderFiles();
    fileInput.value = "";

});

function renderFiles() {

    fileList.innerHTML = "";

    selectedTitle.textContent = `Selected Documents (${selectedFiles.length})`;

    if (selectedFiles.length > 0) {
        clearButton.style.display = "block";
    } else {
        clearButton.style.display = "none";
    }

    if (selectedFiles.length === 0) {

        fileList.classList.remove("has-files");

        const emptyMessage = document.createElement("li");
        emptyMessage.textContent = "No documents selected";
        emptyMessage.classList.add("empty-message");

        fileList.appendChild(emptyMessage);

    return;
}

    for (let file of selectedFiles) {

        const li = document.createElement("li");

        const icon = document.createElement("span");

    if (file.type === "application/pdf") {
        icon.textContent = "📄";
    } 
    else if (file.type.includes("word")) {
        icon.textContent = "📝";
    } 
    else {
        icon.textContent = "📁";
    }

    icon.style.marginRight = "8px";

        const fileName = document.createElement("span");
        fileName.textContent = `${file.name} (${formatFileSize(file.size)})`;


        const deleteButton = document.createElement("button");
        deleteButton.textContent = "X";
        deleteButton.classList.add("delete-button");


        deleteButton.onclick = function() {

            selectedFiles = selectedFiles.filter(
                f => f !== file
            );

            renderFiles();

        };


        li.appendChild(icon);
        li.appendChild(fileName);
    li.appendChild(deleteButton);

        fileList.appendChild(li);
    }
}

saveButton.addEventListener("click", async function () {
    if (saveButton.disabled) {
        return;
    }

    if (selectedFiles.length === 0) {
        showMessage("Select documents first", "error");
        return;
    }

    const newFiles = selectedFiles.filter(file =>
        !uploadedFiles.some(
            uploadedFile =>
                uploadedFile.name === file.name &&
                uploadedFile.size === file.size
        )
    );

        if (newFiles.length === 0) {
            buttonText.textContent = "Already Saved";
            saveButton.disabled = true;

            showMessage("These documents have already been saved", "error");

            setTimeout(() => {
                buttonText.textContent = "Save to Vector Database";
                saveButton.disabled = false;
            }, 2000);

            return;
        }

    const formData = new FormData();

    for (const file of newFiles) {
        formData.append("files", file);
    }

    saveButton.disabled = true;
    spinner.style.display = "inline-block";
    buttonText.textContent = "Uploading...";

    try {
        const response = await fetch(
            "http://127.0.0.1:8000/documents/upload",
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        if (data.message.includes("already")) {
            spinner.style.display = "none";

            buttonText.textContent = "Already Saved";
            saveButton.disabled = true;

            showMessage(data.message, "error");

            setTimeout(() => {
                buttonText.textContent = "Save to Vector Database";
                saveButton.disabled = false;
            }, 2000);

            return;
        }

        if (!response.ok) {
            throw new Error(
                data.detail || "Documents could not be saved."
            );
        }

        uploadedFiles.push(...newFiles);

        buttonText.textContent = "Saved ✓";

        if (data.message.includes("already")) {
            showMessage(
                data.message,
                "error"
            );
        } else {
            showMessage(
                data.message,
                "success"
            );
        }
    } catch (error) {
        buttonText.textContent = "Save failed";

        showMessage(
            error.message || "Could not connect to the backend.",
            "error"
        );
    } finally {
        spinner.style.display = "none";

        setTimeout(() => {
            buttonText.textContent = "Save to Vector Database";
            saveButton.disabled = false;
        }, 2000);
    }
});

clearButton.addEventListener("click", function () {

    selectedFiles = [];

    renderFiles();

});

closeMessage.addEventListener("click", function () {
    messageOverlay.classList.remove("show");
    messageText.textContent = "";
    messageIcon.textContent = "";
    messageModal.className = "";
});

askButton.addEventListener("click", async function () {

    const question = questionInput.value.trim();

    if (!question) {
        showMessage("Please enter a question", "error");
        return;
    }

    askButton.disabled = true;
    askButton.textContent = "Asking...";

    answerText.innerHTML = `
    <div class="loading">
        <span></span>
        Generating answer...
    </div>
`;

answerText.classList.remove("answer");
answerText.classList.remove("empty");
answerText.classList.add("loading");

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/ask",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    question: question
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {
            throw new Error(
                data.detail || "Could not get answer"
            );
        }

        answerText.classList.remove("loading");
        answerText.classList.remove("empty");
        answerText.classList.add("answer");

let html = renderMarkdown(data.answer);

answerText.innerHTML = html;

if (data.sources && data.sources.length > 0) {
    answerText.innerHTML += `
        <div class="sources">
            <strong>Sources</strong>
            <ul>
                ${data.sources.map(
                    source => `<li>${source}</li>`
                ).join("")}
            </ul>
        </div>
    `;
}

    } catch (error) {

        answerText.className = "answer";
        answerText.textContent = 
            "Error: " + error.message;

    } finally {

        askButton.disabled = false;
        askButton.textContent = "Ask";

    }

});

questionInput.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        askButton.click();
    }
});

function renderMarkdown(text) {

    let html = text.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
    );

    html = html.replace(
        /(?:^|\n)\* (.*?)(?=\n|$)/g,
        "<li>$1</li>"
    );

    html = html.replace(
        /(<li>.*?<\/li>)+/gs,
        "<ul>$&</ul>"
    );

    html = html.replace(
        /\n\n/g,
        "<br><br>"
    );

    return html;
}