const API_URL = "http://127.0.0.1:8000";

let deleteMode = null;
let documentToDelete = null;

async function loadDocuments() {
    const container = document.getElementById("documents-container");
    const count = document.getElementById("document-count");

    try {
        const response = await fetch(`${API_URL}/documents`);

        if (!response.ok) {
            throw new Error("Failed to load documents");
        }

        const data = await response.json();
        const documents = data.documents || [];

        count.textContent =
            `${documents.length} document${documents.length === 1 ? "" : "s"}`;

        if (documents.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📄</div>
                    <h3>No documents uploaded</h3>
                    <p>Uploaded documents will appear here.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = "";

        documents.forEach(doc => {
            const card = document.createElement("div");

            card.className = "document-card";

            card.innerHTML = `
                <div class="file-icon">
                    ${getFileIcon(doc.filename)}
                </div>

                <div class="document-info">
                    <div class="document-name">
                        ${escapeHtml(doc.filename)}
                    </div>

                    <div class="document-size">
                        ${formatFileSize(doc.size)}
                    </div>
                </div>

                <button
                    class="delete-button"
                    onclick="openDeleteModal('${escapeHtml(doc.filename)}')"
                >
                    Delete
                </button>
            `;

            container.appendChild(card);
        });

    } catch (error) {
        console.error(error);

        count.textContent = "";

        container.innerHTML = `
            <div class="error">
                <strong>Could not connect to the backend.</strong>
                <span>Make sure the FastAPI server is running.</span>
            </div>
        `;
    }
}

function openDeleteModal(filename) {
    deleteMode = "single";
    documentToDelete = filename;

    const modal = document.getElementById("delete-modal");
    const title = document.getElementById("modal-title");
    const message = document.getElementById("modal-message");
    const warning = document.getElementById("modal-warning");
    const confirmButton = document.getElementById("confirm-button");

    title.textContent = "Delete Document?";

    message.innerHTML =
        `Are you sure you want to delete <strong>${escapeHtml(filename)}</strong>?`;

    warning.textContent =
        "This will also remove its vectors and related conflicts.";

    confirmButton.textContent = "Delete";
    confirmButton.className = "confirm-button";
    confirmButton.style.display = "";

    modal.classList.remove("hidden");
}

function openDeleteAllModal() {
    deleteMode = "all";
    documentToDelete = null;

    const modal = document.getElementById("delete-modal");
    const title = document.getElementById("modal-title");
    const message = document.getElementById("modal-message");
    const warning = document.getElementById("modal-warning");
    const confirmButton = document.getElementById("confirm-button");

    title.textContent = "Delete All Documents?";

    message.textContent =
        "Are you sure you want to delete all uploaded documents?";

    warning.textContent =
        "This will permanently remove all documents, vectors and related conflicts.";

    confirmButton.textContent = "Delete All";
    confirmButton.className = "confirm-button danger";
    confirmButton.style.display = "";

    modal.classList.remove("hidden");
}

function closeModal() {
    deleteMode = null;
    documentToDelete = null;

    document
        .getElementById("delete-modal")
        .classList.add("hidden");
}

async function confirmDelete() {
    const confirmButton =
        document.getElementById("confirm-button");

    if (deleteMode === "single" && !documentToDelete) {
        return;
    }

    confirmButton.disabled = true;
    confirmButton.textContent = "Deleting...";

    try {
        let response;

        if (deleteMode === "single") {
            response = await fetch(
                `${API_URL}/documents/${encodeURIComponent(documentToDelete)}`,
                {
                    method: "DELETE"
                }
            );
        } else if (deleteMode === "all") {
            response = await fetch(
                `${API_URL}/documents/all`,
                {
                    method: "DELETE"
                }
            );
        } else {
            return;
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Failed to delete document(s)"
            );
        }

        closeModal();

        await loadDocuments();

    } catch (error) {
        console.error(error);

        closeModal();

        showError(error.message);

    } finally {
        confirmButton.disabled = false;
        confirmButton.textContent = "Delete";
    }
}

function showError(message) {
    const modal =
        document.getElementById("delete-modal");

    const title =
        document.getElementById("modal-title");

    const messageElement =
        document.getElementById("modal-message");

    const warning =
        document.getElementById("modal-warning");

    const confirmButton =
        document.getElementById("confirm-button");

    const cancelButton =
        document.getElementById("cancel-button");

    title.textContent = "Something went wrong";

    messageElement.textContent = message;

    warning.textContent = "";

    confirmButton.style.display = "none";

    cancelButton.textContent = "Close";

    modal.classList.remove("hidden");

    cancelButton.onclick = () => {
        confirmButton.style.display = "";
        cancelButton.textContent = "Cancel";
        cancelButton.onclick = closeModal;
        closeModal();
    };
}

function formatFileSize(bytes) {
    if (!bytes || bytes === 0) {
        return "0 Bytes";
    }

    const units = [
        "Bytes",
        "KB",
        "MB",
        "GB"
    ];

    const index = Math.floor(
        Math.log(bytes) / Math.log(1024)
    );

    const size =
        bytes / Math.pow(1024, index);

    return `${size.toFixed(
        index === 0 ? 0 : 1
    )} ${units[index]}`;
}

function getFileIcon(filename) {
    const extension =
        filename
            .split(".")
            .pop()
            .toLowerCase();

    if (extension === "pdf") {
        return "PDF";
    }

    if (extension === "docx") {
        return "DOC";
    }

    if (extension === "txt") {
        return "TXT";
    }

    return "FILE";
}

function escapeHtml(value) {
    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

document
    .getElementById("delete-all-button")
    .addEventListener(
        "click",
        openDeleteAllModal
    );

document
    .getElementById("cancel-button")
    .addEventListener(
        "click",
        closeModal
    );

document
    .getElementById("confirm-button")
    .addEventListener(
        "click",
        confirmDelete
    );

document
    .querySelector(".modal-overlay")
    .addEventListener(
        "click",
        closeModal
    );

loadDocuments();