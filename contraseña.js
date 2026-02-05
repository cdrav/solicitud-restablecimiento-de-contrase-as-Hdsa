// Configuración
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzYQKIythruQYZe1WMEShZ29Mk-1qUfrdwCXarl1uZ85ZC8s0P8dgrVsxo0HzXf3uYaiQ/exec';

// Mostrar advertencia de política de correos al seleccionar la opción
document.getElementById('checkEmail').addEventListener('change', function() {
    const alertBox = document.getElementById('emailPolicyAlert');
    alertBox.style.display = this.checked ? 'block' : 'none';
});

document.getElementById('passwordRequestForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validación simple de selección de sistema
    const checkboxes = document.querySelectorAll('input[name="sistema"]:checked');
    if (checkboxes.length === 0) {
        showStatusModal('Atención', 'Por favor seleccione al menos un sistema (SIHOS, PC, etc.)', false);
        return;
    }

    // Efecto de carga en el botón
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Procesando...';

    // Recopilar datos para enviar
    const formData = new FormData(this);
    const data = new URLSearchParams();
    
    // Unir los sistemas seleccionados en un solo string
    let sistemasSeleccionados = [];
    checkboxes.forEach((cb) => sistemasSeleccionados.push(cb.value));
    
    // Llenar el objeto data evitando duplicar la clave 'sistema'
    for (const pair of formData.entries()) {
        if (pair[0] !== 'sistema') {
            data.append(pair[0], pair[1]);
        }
    }
    data.append('sistemas', sistemasSeleccionados.join(', '));

    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: data
    })
    .then(response => response.json())
    .then(response => {
        if (response.result === 'success') {
            showStatusModal('¡Solicitud Exitosa!', 'La solicitud ha sido radicada correctamente. El documento PDF ha sido generado y archivado en el área de Sistemas.', true);
            document.getElementById('passwordRequestForm').reset();
            document.getElementById('emailPolicyAlert').style.display = 'none';
        } else {
            throw new Error(response.error);
        }
    })
    .catch(error => {
        console.error('Error!', error.message);
        showStatusModal('Error', 'Hubo un error al enviar la solicitud. Por favor intente nuevamente.', false);
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    });
});

// Función para mostrar el modal de estado con estilos dinámicos
function showStatusModal(title, message, isSuccess) {
    const modalEl = document.getElementById('statusModal');
    const iconEl = document.getElementById('statusIcon');
    const titleEl = document.getElementById('statusTitle');
    const msgEl = document.getElementById('statusMessage');
    const btnEl = document.getElementById('statusBtn');

    if (isSuccess) {
        iconEl.className = 'bi bi-check-circle-fill text-success';
        btnEl.className = 'btn btn-success px-4 rounded-pill fw-semibold';
    } else {
        iconEl.className = 'bi bi-exclamation-triangle-fill text-danger';
        btnEl.className = 'btn btn-danger px-4 rounded-pill fw-semibold';
    }

    titleEl.textContent = title;
    msgEl.textContent = message;

    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}