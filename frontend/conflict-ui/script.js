const API_URL = "http://127.0.0.1:8000";

let documentToDelete = null;

async function loadConflicts() {

    const container = document.getElementById("conflicts-container");
    const status = document.getElementById("status");

    try {

        const response = await fetch(`${API_URL}/conflicts`);

        if (!response.ok) {
            throw new Error("Failed to load conflicts");
        }

        const data = await response.json();

        const conflicts = data.conflicts || [];


        if (conflicts.length === 0) {

            status.textContent = "No conflicts detected.";

            container.innerHTML = "";

            return;
        }


        status.textContent =
            `${conflicts.length} conflict${conflicts.length === 1 ? "" : "s"} detected`;


        container.innerHTML = "";


        conflicts.forEach(conflict => {

            const card = document.createElement("div");

            card.className = "conflict-card";


            const confidence = conflict.confidence
                ? `${(conflict.confidence * 100).toFixed(1)}%`
                : "N/A";


            const lineA = conflict.line_a !== null
                ? `Line ${conflict.line_a}`
                : "Line unavailable";


            const lineB = conflict.line_b !== null
                ? `Line ${conflict.line_b}`
                : "Line unavailable";

            const formattedA =
                formatConflictText(conflict.text_a);

            const formattedB =
                formatConflictText(conflict.text_b);


            card.innerHTML = `

                <div class="conflict-header">

                    <div class="document">

                        <span class="document-name">
                            ${escapeHtml(conflict.document_a)}
                        </span>

                        <span class="line">
                            ${lineA}
                        </span>

                        <button
                            class="delete-button"
                            onclick="deleteDocument('${escapeHtml(conflict.document_a)}')"
                        >
                            Delete Document
                        </button>

                    </div>


                    <div class="versus">
                        VS
                    </div>


                    <div class="document">

                        <span class="document-name">
                            ${escapeHtml(conflict.document_b)}
                        </span>

                        <span class="line">
                            ${lineB}
                        </span>

                        <button
                            class="delete-button"
                            onclick="deleteDocument('${escapeHtml(conflict.document_b)}')"
                        >
                            Delete Document
                        </button>

                    </div>

                </div>


                <div class="conflict-content">


                    <!-- DOCUMENT A -->

                    <div class="text-box">

                        <h3>Document A</h3>


                        ${
                            formattedA.heading
                                ? `
                                    <div class="topic">
                                        ${escapeHtml(formattedA.heading)}
                                    </div>
                                  `
                                : ""
                        }


                        ${
                            formattedA.section
                                ? `
                                    <div class="section">
                                        ${escapeHtml(formattedA.section)}
                                    </div>
                                  `
                                : ""
                        }


                        <div class="statement-label">
                            Conflicting statement
                        </div>


                        <p class="conflicting-statement">
                            ${escapeHtml(formattedA.statement)}
                        </p>

                    </div>



                    <!-- DOCUMENT B -->

                    <div class="text-box">

                        <h3>Document B</h3>


                        ${
                            formattedB.heading
                                ? `
                                    <div class="topic">
                                        ${escapeHtml(formattedB.heading)}
                                    </div>
                                  `
                                : ""
                        }


                        ${
                            formattedB.section
                                ? `
                                    <div class="section">
                                        ${escapeHtml(formattedB.section)}
                                    </div>
                                  `
                                : ""
                        }


                        <div class="statement-label">
                            Conflicting statement
                        </div>


                        <p class="conflicting-statement">
                            ${escapeHtml(formattedB.statement)}
                        </p>

                    </div>

                </div>


                <div class="conflict-footer">

                    <span class="conflict-type">
                        ${escapeHtml(
                            conflict.conflict_type ||
                            "CONTRADICTION"
                        )}
                    </span>


                    <span class="confidence">
                        Confidence: ${confidence}
                    </span>

                </div>
            `;


            container.appendChild(card);

        });

    } catch (error) {

        console.error(error);

        status.textContent =
            "Could not connect to the backend.";


        container.innerHTML = `

            <div class="error">
                Make sure the FastAPI backend is running.
            </div>

        `;
    }
}

function formatConflictText(text) {

    if (!text) {

        return {
            heading: "",
            section: "",
            statement: ""
        };

    }


    const lines = String(text)
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0);


    if (lines.length === 0) {

        return {
            heading: "",
            section: "",
            statement: ""
        };

    }


    if (lines.length === 1) {

        return {
            heading: "",
            section: "",
            statement: lines[0]
        };

    }


    if (lines.length === 2) {

        return {
            heading: lines[0],
            section: "",
            statement: lines[1]
        };

    }


    return {
        heading: lines[0],
        section: lines[1],
        statement: lines.slice(2).join(" ")
    };
}

function deleteDocument(filename) {

    documentToDelete = filename;


    const filenameElement =
        document.getElementById("delete-filename");


    filenameElement.textContent = filename;


    const modal =
        document.getElementById("delete-modal");


    modal.classList.remove("hidden");
}

function closeDeleteModal() {

    documentToDelete = null;


    const modal =
        document.getElementById("delete-modal");


    modal.classList.add("hidden");


    // Restore normal modal state

    const title =
        modal.querySelector("h2");

    const paragraph =
        modal.querySelector("p");

    const warning =
        modal.querySelector(".warning-text");

    const confirmButton =
        document.getElementById("confirm-delete");

    const cancelButton =
        document.getElementById("cancel-delete");


    title.textContent = "Delete Document?";


    paragraph.innerHTML =
        `Are you sure you want to delete
        <strong id="delete-filename"></strong>?`;


    warning.textContent =
        "This will also remove its vectors and related conflicts.";


    confirmButton.style.display = "block";

    cancelButton.textContent = "Cancel";

    cancelButton.onclick = closeDeleteModal;
}

async function confirmDelete() {

    if (!documentToDelete) {
        return;
    }


    const filename = documentToDelete;


    const confirmButton =
        document.getElementById("confirm-delete");


    confirmButton.disabled = true;

    confirmButton.textContent = "Deleting...";


    try {

        const response = await fetch(
            `${API_URL}/documents/${encodeURIComponent(filename)}`,
            {
                method: "DELETE"
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Failed to delete document"
            );

        }


        closeDeleteModal();


        await loadConflicts();


    } catch (error) {

        console.error(error);


        closeDeleteModal();


        showErrorModal(
            `Could not delete document: ${error.message}`
        );

    } finally {

        confirmButton.disabled = false;

        confirmButton.textContent = "Delete";

    }
}

function showErrorModal(message) {

    const modal =
        document.getElementById("delete-modal");


    const title =
        modal.querySelector("h2");


    const paragraph =
        modal.querySelector("p");


    const warning =
        modal.querySelector(".warning-text");


    const confirmButton =
        document.getElementById("confirm-delete");


    const cancelButton =
        document.getElementById("cancel-delete");


    title.textContent = "Error";


    paragraph.textContent = message;


    warning.textContent = "";


    confirmButton.style.display = "none";


    cancelButton.textContent = "Close";


    modal.classList.remove("hidden");


    cancelButton.onclick = () => {

        closeDeleteModal();

    };
}

function escapeHtml(value) {

    if (value === null || value === undefined) {
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
    .getElementById("cancel-delete")
    .addEventListener(
        "click",
        closeDeleteModal
    );


document
    .getElementById("confirm-delete")
    .addEventListener(
        "click",
        confirmDelete
    );


document
    .querySelector(".modal-overlay")
    .addEventListener(
        "click",
        closeDeleteModal
    );

loadConflicts();