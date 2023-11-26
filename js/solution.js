    // API => www.themealdb.com

    // Inicia la aplicació
function iniciarApp() {
    let favoritePage = false;
    const resultado = document.querySelector("#resultado");
    const selectCategorias = document.querySelector("#categorias");

    if (selectCategorias) {
        selectCategorias.addEventListener("change", obtenerRecetas);
    }

    const favSelector = document.querySelector(".favoritos");

    if (favSelector) {
        favoritePage = true;
        obtainFav();
        return;
    }

    const modal = new bootstrap.Modal("#modal", {});
    limpiarHTML(modal);
    obtenerCategorias();

    function obtenerCategorias() {
        let url = "https://www.themealdb.com/api/json/v1/1/categories.php";

        fetch(url)
            .then((res) => res.json())
            .then((data) => mostrarCategorias(data.categories));
    }

    function mostrarCategorias(categorias) {
        categorias.forEach((categoria) => {
            const option = document.createElement("OPTION");
            option.value = categoria.strCategory;
            option.textContent = categoria.strCategory;
            selectCategorias.appendChild(option);
        });
    }

    function obtenerRecetas(e) {
        const categoria = e.target.value;
        let url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`;

        fetch(url)
            .then((res) => res.json())
            .then((data) => mostrarRecetas(data.meals));
    }

    function createFavoriteIconForImage(idMeal, strMeal, strMealThumb, div, recetaImagen) {
        const icon = createIcon(idMeal);
        icon.id = `icon-${idMeal}`;
        icon.style.zIndex = "2";
        icon.style.color = "gold"
        icon.style.fontSize = "2em"
        icon.classList.add("btn-warning")
        icon.addEventListener('click', function () {
            checkIfFavoriteExists(idMeal, null, icon, strMeal, strMealThumb);
        })
        div.appendChild(recetaImagen);
        div.appendChild(icon);
    }

    function createPaginationIcons(i, pageNumber, recetas, itemsPerPage, paginationContainer) {
        const pageItem = document.createElement("span");
        pageItem.textContent = i;
        pageItem.classList.add("page-item");
        pageItem.classList.add("btn-dark", "btn")
        if (i === pageNumber) {
            pageItem.classList.remove("btn-dark")
            pageItem.classList.add("active", "btn-danger");
        }
        pageItem.dataset.pageNumber = i;
        pageItem.addEventListener("click", function () {
            const newPageNumber = parseInt(this.dataset.pageNumber);
            mostrarRecetas(recetas, newPageNumber, itemsPerPage);
        });
        paginationContainer.appendChild(pageItem);
    }

    function clearPaginationIfExistant() {
        const existingPagination = document.querySelector(".pagination");
        if (existingPagination) {
            existingPagination.remove();
        }
    }

    function createPagination(totalPages, pageNumber, recetas, itemsPerPage) {
        const paginationContainer = document.createElement("div");
        paginationContainer.classList.add("pagination");
        for (let i = 1; i <= totalPages; i++) {
            createPaginationIcons(i, pageNumber, recetas, itemsPerPage, paginationContainer);
        }
        clearPaginationIfExistant();
        resultado.appendChild(paginationContainer);
    }

    function addItemsToBody(recetaCardBody, recetaHeading, recetaButton, recetaCard, div, contenedorRecetas) {
        recetaCardBody.appendChild(recetaHeading)
        recetaCardBody.appendChild(recetaButton)
        recetaCard.appendChild(div)
        recetaCard.appendChild(recetaCardBody)
        contenedorRecetas.appendChild(recetaCard)
        resultado.appendChild(contenedorRecetas)
    }

    function createHeadingRecipe(strMeal, receta) {
        const recetaHeading = document.createElement("H3")
        recetaHeading.classList.add("card-title", "mb-3")
        recetaHeading.textContent = strMeal ?? receta.mealTitle
        return recetaHeading;
    }

    function createButtonToDisplayModal(idMeal, receta) {
        const recetaButton = document.createElement("BUTTON")
        recetaButton.classList.add("btn", "btn-danger", "w-100")
        recetaButton.textContent = "Ver Receta"
        recetaButton.onclick = function () {
            seleccionarReceta(idMeal ?? receta.id)
        }
        return recetaButton;
    }

    function createImageElement(strMeal, strMealThumb, receta) {
        const recetaImagen = document.createElement("IMG");
        recetaImagen.classList.add("card-img-top");
        recetaImagen.alt = `Imagen de la receta ${strMeal}`;
        recetaImagen.src = strMealThumb ?? receta.image;
        return recetaImagen;
    }

    function createImageRecipe(strMeal, strMealThumb, receta, idMeal, div) {
        const recetaImagen = createImageElement(strMeal, strMealThumb, receta);
        if (favoritePage === false) {
            createFavoriteIconForImage(idMeal, strMeal, strMealThumb, div, recetaImagen);
        } else {
            div.appendChild(recetaImagen)
        }
        div.classList.add("stack-container");
    }

    function createRecipeCard(receta) {
        const {idMeal, strMeal, strMealThumb} = receta
        const contenedorRecetas = document.createElement("DIV")
        contenedorRecetas.classList.add("col-md-4")
        const recetaCard = document.createElement("DIV")
        recetaCard.classList.add("card", "mb-4")
        const div = document.createElement("DIV");
        createImageRecipe(strMeal, strMealThumb, receta, idMeal, div);
        const recetaCardBody = document.createElement("DIV")
        recetaCardBody.classList.add("card-body")
        const recetaHeading = createHeadingRecipe(strMeal, receta);
        const recetaButton = createButtonToDisplayModal(idMeal, receta);
        addItemsToBody(recetaCardBody, recetaHeading, recetaButton, recetaCard, div, contenedorRecetas);
    }

    function mostrarRecetas(recetas = [], pageNumber = 1, itemsPerPage = 15) {
        limpiarHTML(resultado);
        const startIndex = (pageNumber - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedRecetas = recetas.slice(startIndex, endIndex);
        const totalPages = Math.ceil(recetas.length / itemsPerPage);
        paginatedRecetas.forEach((receta) => {
            createRecipeCard(receta);
        })
        createPagination(totalPages, pageNumber, recetas, itemsPerPage);
    }

    function limpiarHTML(selector) {
        while (selector.firstChild) {
            selector.removeChild(selector.firstChild)
        }
    }

// Seleccionar Receta
    function seleccionarReceta(id) {
        const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
        fetch(url)
            .then((res) => res.json())
            .then((data) => mostrarRecetaModal(data.meals[0]))
    }

    function favoriteExistsNoBtn(idMeal, icon) {
        console.log("Entering favoriteExistsNoBtn. idMeal:", idMeal);
        eliminarFav(idMeal);
        icon.classList.remove("fas");
        icon.classList.add("far");
        mostrarToast("Receta eliminada de favoritos correctamente");
        console.log("Exiting favoriteExistsNoBtn");
        return;
    }



    function favoriteDoesNotExistsNoBtn(idMeal, icon, strMeal, strMealThumb) {
        console.log("Entering favoriteDoesNotExistsNoBtn. idMeal:", idMeal);
        icon.classList.add("fas");
        icon.classList.remove("far");
        agregarFavorito({
            id: idMeal,
            mealTitle: strMeal,
            image: strMealThumb
        });
        mostrarToast("Receta añadida correctamente");
        console.log("Exiting favoriteDoesNotExistsNoBtn");
    }
    function favoriteExistsBtn(idMeal, btnFavorito, icon) {
        console.log("Entering favoriteExistsBtn. idMeal:", idMeal);
        eliminarFav(idMeal);
        btnFavorito.classList.add("btn-dark");
        btnFavorito.classList.remove("btn-warning");
        icon.classList.remove("fas");
        icon.classList.add("far");
        mostrarToast("Receta eliminada de favoritos correctamente");

    }

    function favoriteDoesNotExistBtn(btnFavorito, icon, idMeal, strMeal, strMealThumb) {
        btnFavorito.classList.add("btn-warning");
        btnFavorito.classList.remove("btn-dark");
        icon.classList.add("fas");
        icon.classList.remove("far");
        agregarFavorito({
            id: idMeal,
            mealTitle: strMeal,
            image: strMealThumb
        });
        mostrarToast("Receta añadida correctamente");
    }

    function checkIfFavoriteExists(idMeal, btnFavorito, iconElement, strMeal, strMealThumb) {
        if (btnFavorito !== null) {
            if (existeFavorito(idMeal)) {
                favoriteExistsBtn(idMeal, btnFavorito, iconElement);
                return
            }
            favoriteDoesNotExistBtn(btnFavorito, iconElement, idMeal, strMeal, strMealThumb);
            return
        }
        if (existeFavorito(idMeal)) {
            favoriteExistsNoBtn(idMeal, iconElement);
            return
        }
        favoriteDoesNotExistsNoBtn(idMeal, iconElement, strMeal, strMealThumb);

    }

    function createIngredients(receta, i, listGroup) {
        if (receta[`strIngredient${i}`]) {
            const ingrediente = receta[`strIngredient${i}`]
            const cantidad = receta[`strMeasure${i}`]
            const ingredientLi = document.createElement("LI")
            ingredientLi.classList.add("list-group-item")
            ingredientLi.textContent = `${cantidad} - ${ingrediente}`

            listGroup.appendChild(ingredientLi)
        }
    }

    function createFavoriteButton(modalFooter, idMeal, iconElement) {
        const btnFavorito = document.createElement("BUTTON");
        modalFooter.appendChild(btnFavorito);
        existeFavorito(idMeal)
            ? btnFavorito.classList.add("btn", "btn-warning", "col")
            : btnFavorito.classList.add("btn", "btn-dark", "col");
        btnFavorito.appendChild(iconElement)
        return btnFavorito;
    }

    function createCloseButton(modalFooter) {
        const btnCerrar = document.createElement("BUTTON")
        btnCerrar.classList.add("btn", "btn-secondary", "col")
        btnCerrar.textContent = "cerrar"
        modalFooter.appendChild(btnCerrar)
        btnCerrar.onclick = function () {
            modal.hide()
        }
    }

    function createFooterCard(idMeal, strMeal, strMealThumb) {
        const modalFooter = document.querySelector(".modal-footer");
        limpiarHTML(modalFooter);
        let iconElement = createIcon(idMeal);
        const btnFavorito = createFavoriteButton(modalFooter, idMeal, iconElement);
        modalFooter.appendChild(btnFavorito)
        btnFavorito.onclick = function () {
            checkIfFavoriteExists(idMeal, btnFavorito, iconElement, strMeal, strMealThumb);
        }
        createCloseButton(modalFooter);
    }

// Mostrar la receta en el modal
    async function mostrarRecetaModal(receta) {
        const {idMeal, strInstructions, strMeal, strMealThumb} = receta
        const modalTitle = document.querySelector(".modal .modal-title")
        const modalBody = document.querySelector(".modal .modal-body")
        modalTitle.textContent = strMeal
        modalBody.innerHTML = `
            <img class="img-fluid" src=${strMealThumb} alt=${strMeal}>
            <h3 class="my-3">Instrucciones</h3>
            <p>${strInstructions}</p>
        `
        const listGroup = document.createElement("UL")
        listGroup.classList.add("list-group")
        for (let i = 1; i <= 20; i++) {
            createIngredients(receta, i, listGroup);
        }
        modalBody.appendChild(listGroup)
        createFooterCard(idMeal, strMeal, strMealThumb);
        modal.show()
    }

    function agregarFavorito(receta) {
        const fav = JSON.parse(localStorage.getItem("recipes")) ?? []
        localStorage.setItem(
            "recipes", JSON.stringify([...fav, receta])
        )
    }


    function existeFavorito(idMeal) {
        const fav = JSON.parse(localStorage.getItem("recipes")) ?? [];
        console.log("Favorites:", fav);
        return fav.some((favorite) => favorite.id === idMeal);
    }

    function eliminarFav(id) {
        const fav = JSON.parse(localStorage.getItem("recipes")) ?? [];
        console.log("Deleting from favorites. ID:", id, "Favorites before:", fav);
        const newFav = fav.filter((favorite) => favorite.id !== id);
        localStorage.setItem("recipes", JSON.stringify(newFav));
        console.log("Deleted from favorites. Favorites after:", newFav);
    }


    function createIcon(idMeal) {
        const iconElement = document.createElement("i");
        iconElement.classList.add("far", "fa-star");
        if (existeFavorito(idMeal)) {
            iconElement.classList.add("fas");
            iconElement.classList.remove("far");
        } else {
            iconElement.classList.remove("fas");
            iconElement.classList.add("far");
        }
        return iconElement
    }

    function createIndexButtonToast() {
        const indexButton = document.createElement("button");
        indexButton.textContent = "Volver al inicio"
        indexButton.classList.add("btn-dark", "btn", "m-2")
        indexButton.onclick = function () {
            window.location.href = "index.html";
        }
        return indexButton;
    }

    function createFavoriteButtonToast() {
        const favButton = document.createElement("button")
        favButton.textContent = "Ir a Favoritos"
        favButton.classList.add("btn-warning", "btn", "m-2")
        favButton.onclick = function () {
            window.location.href = "favoritos.html";
        };
        return favButton;
    }

    function createToast(toast, toastBody, mensaje, favButton, indexButton) {
        const newToast = new bootstrap.Toast(toast)
        toastBody.innerHTML = mensaje + "<br>"
        toastBody.appendChild(favButton)
        toastBody.appendChild(indexButton)
        return newToast;
    }

    function mostrarToast(mensaje) {
        const toast = document.querySelector("#toast")
        const toastBody = document.querySelector(".toast-body")
        const indexButton = createIndexButtonToast();
        const favButton = createFavoriteButtonToast();
        const newToast = createToast(toast, toastBody, mensaje, favButton, indexButton);
        newToast.show()
    }

    function obtainFav() {
        const fav = JSON.parse(localStorage.getItem("recipes"))
        if (fav.length) {
            mostrarRecetas(fav)
        }
        const noFav = document.createElement("P")
        noFav.textContent = "You don't have any favorites"
    }
}

function scrollButtonDisplay(scrollToTopBtn, iconDiv) {
    if (document.body.scrollTop > 1000 || document.documentElement.scrollTop > 1000) {
        scrollToTopBtn.classList.add('show');
        iconDiv.classList.add("show")
    } else {
        scrollToTopBtn.classList.remove('show');
        iconDiv.classList.remove("show")
    }
}

document.addEventListener("DOMContentLoaded", function () {
    iniciarApp();
    const scrollToTopBtn = document.getElementById("scrollToTopBtn");
    const iconDiv = document.querySelector("#iconDiv");

    window.onscroll = function () {
        scrollButtonDisplay(scrollToTopBtn, iconDiv);
    };
    scrollToTopBtn.addEventListener("click", function () {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    });
});
