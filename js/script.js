//Settings:
var checkoutapi = 'https://0jxfak47p9.execute-api.us-east-1.amazonaws.com/prod/anafonsacaApiDb';
var estoqueurl = 'https://anafonsaca.s3.amazonaws.com/estoque.json';
var cepdeorigem = 88330786;


var carrinho = [];
var carticonnumber = 0;
var cartopen = false;
var tableopen = false;
var estoqueUni;
var estoquePeq;
var estoqueMed;
var estoqueGra;
var estoqueJson;
var orderdata = {};
var uniqueid;




/////////////////////////////// cep/////////////////////////
function limpa_formulário_cep() {
    //Limpa valores do formulário de cep.
    document.getElementById('rua').value = ("");
    document.getElementById('bairro').value = ("");
    document.getElementById('cidade').value = ("");
    document.getElementById('uf').value = ("");
}

function meu_callback(conteudo) {
    if (!("erro" in conteudo)) {
        //Atualiza os campos com os valores.
        document.getElementById('formrua').value = (conteudo.logradouro).toLowerCase();
        document.getElementById('formbairro').value = (conteudo.bairro).toLowerCase();
        document.getElementById('formcidade').value = (conteudo.localidade).toLowerCase();
        document.getElementById('formestado').value = (conteudo.uf).toUpperCase();
    } //end if.
    else {
        //CEP não Encontrado.
        limpa_formulário_cep();
    }
}

function pesquisacep(valor) {

    //Nova variável "cep" somente com dígitos.
    var cep = valor.replace(/\D/g, '');

    //Verifica se campo cep possui valor informado.
    if (cep != "") {

        //Expressão regular para validar o CEP.
        var validacep = /^[0-9]{8}$/;

        //Valida o formato do CEP.
        if (validacep.test(cep)) {

            //Preenche os campos com "..." enquanto consulta webservice.
            document.getElementById('formrua').value = "...";
            document.getElementById('formbairro').value = "...";
            document.getElementById('formcidade').value = "...";
            document.getElementById('formestado').value = "...";

            //Cria um elemento javascript.
            var script = document.createElement('script');

            //Sincroniza com o callback.
            script.src = 'https://viacep.com.br/ws/' + cep + '/json/?callback=meu_callback';

            //Insere script no documento e carrega o conteúdo.
            document.body.appendChild(script);

        } //end if.
        else {
            //cep é inválido.
            limpa_formulário_cep();

        }
    } //end if.
    else {
        //cep sem valor, limpa formulário.
        limpa_formulário_cep();
    }
};
///////////////////////////////////////////////////////////

function esvaziaCarrinho() {
    var carrinho = [];
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

function toggleTable () {

tabmedidas = document.getElementById("tabelamedidas");

if (tableopen) {
tableopen = false;
tabmedidas.style.display = "none";
} else {
tableopen = true;
tabmedidas.style.display = "block";
}
}

function toggleCart() {
    carticon = document.getElementById("bagicon"); 
    closeicon = document.getElementById("closeicon");
    shopcart = document.getElementById("shopCart");
    pagecontent = document.getElementById("pagecontent");

    if (cartopen) {
        cartopen = false;
        shopcart.style.display = "none";
      //  pagecontent.style.display = "";
        //carticon.innerHTML = carticonnumber;
        //carticon.style.display = "";
        //closeicon.style.display = "none";
     

    } else {
        cartopen = true;
        shopcart.style.display = "block";
      //  pagecontent.style.display = "none";
      //  carticon.style.display = "none";
      //  closeicon.style.display = "";
        dropInfo('suacompra');


    }
    carticon.classList.remove("w3-animate-zoom");
    cartRender()
}



// var size = null; delete?

var carrinhostored = localStorage.getItem("carrinho");
if (carrinhostored != null) {
    carrinho = JSON.parse(carrinhostored);
}




function setSize(size) {
    if (!size.classList.contains('w3-disabled')) {
        tamanho = size.innerHTML;

        addbuttom = document.getElementById("btnadd");
        addbuttom.setAttribute("data-tamanho", tamanho);
        addbuttom.classList.remove("w3-disabled");
        var sizebuttons = document.getElementsByClassName("sizebutton");
        for (i = 0; i < sizebuttons.length; i++) {

            sizebuttons[i].classList.remove("selected");
        }

        size.classList.add("selected");

    } else {
        document.getElementById('avisemetexto').innerHTML = 'avise-me quando o tamanho <b>' + size.innerHTML + '</b> voltar ao estoque';
        document.getElementById('aviseme').style.display = 'block'
    }
}


function addToCart(product) {
    if (!product.classList.contains('w3-disabled')) {
        objeto = JSON.stringify(product.dataset);
        carrinho.push(objeto);
        localStorage.setItem("carrinho", JSON.stringify(carrinho));
        cartRender();
        estoqueLoad(estoqueJson);
        addSuccess();
    }
}

function removeFromCart() {
    carrinho.splice(document.activeElement.dataset.id, 1);
    localStorage.setItem("carrinho", JSON.stringify(carrinho));

    cartRender();
    estoqueLoad(estoqueJson);

}


/// cart render start
function cartRender() {
    var carttotal = 0;
    var cartcounter = 0;
    shopcartview = document.getElementById("shopcartview");
    carthtml = document.getElementById("carthtml");
    carthtml.innerHTML = "";
    //document.getElementById("totalprice2").innerHTML = '';
    document.getElementById("bagstatus").innerHTML = "";

    if (carrinho.length == 0) {
        carticon = document.getElementById("bagicon");  
        carticon.innerHTML = '';
        carticon.style.display = "none";

        document.getElementById('suacomprabuttom').classList.add('w3-disabled');
        document.getElementById('entregabuttom').classList.add('w3-disabled');
        document.getElementById('checkoutbuttom').classList.add('w3-disabled');

        shopcartview.style.display = "none";


        bagstatus = document.getElementById("bagstatus");
        emptydiv = document.createElement("div");
        emptydiv.className = "w3-display-container  w3-padding w3-margin-bottom empty";
        bagstatus.appendChild(emptydiv);

        emptytxt = document.createElement("p");
        emptytxt.className = "w3-display-middle";
        emptytxt.innerHTML = "nenhum item selecionado";
        emptydiv.appendChild(emptytxt);
      
        

        // document.getElementById("bagbuttom").style.display = "none";
    } else {

        shopcartview.style.display = "";
        document.getElementById('suacomprabuttom').classList.remove('w3-disabled');
        document.getElementById('entregabuttom').classList.remove('w3-disabled');
        document.getElementById('checkoutbuttom').classList.remove('w3-disabled');



        for (i = 0; i < carrinho.length; i++) {
            obj = JSON.parse(carrinho[i]);

            cartcounter += 1;
            carttotal += parseFloat(obj.valor);

            //item card

            itemcard = document.createElement("div");
            itemcard.className = "w3-card w3-round-large w3-display-container w3-padding w3-margin-bottom itemsdiv";
            carthtml.appendChild(itemcard);

            //item img
            itemdiv = document.createElement("div");
            itemdiv.className = "evenly";
            itemcard.appendChild(itemdiv);

            itemdiv2 = document.createElement("div");
            itemdiv2.className = "column";
            itemdiv.appendChild(itemdiv2);

            imglink = document.createElement("a");
           // imglink.className = "w3-round-large w3-card itemthumb";
            imglink.setAttribute('href', obj.path);
            itemdiv2.appendChild(imglink);

            itemimg = document.createElement("img");
            itemimg.className = "w3-card itemthumb";
            itemimg.src = '/img/' + obj.sku + '/01.webp';
            imglink.appendChild(itemimg);

            //item remove btn
            removeButtom = document.createElement("button");
            //removeButtom.innerHTML = '<svg class="icon"><use xlink:href="/assets/symbol-defs.svg#icon-bin"></use></svg>';
                    removeButtom.innerHTML = '<span class="mini">remover</span>';
            removeButtom.dataset.id = i;
            removeButtom.className = "w3-button w3-white w3-display-bottomright w3-round-large w3-tiny hover-f2f0eb";
            removeButtom.addEventListener("click", removeFromCart);
            itemcard.appendChild(removeButtom);

            //item info div

            iteminfodiv = document.createElement("div");
            iteminfodiv.className = "w3-display-middle w3-margin-left w3-row-padding";
            itemcard.appendChild(iteminfodiv);

            //item title

            itemtitle = document.createElement("a");
            itemtitle.className = "bold w3-large"
            itemtitle.setAttribute('href', obj.path);
            itemtitle.innerHTML = obj.nome;
            iteminfodiv.appendChild(itemtitle);

            // break line
            iteminfodiv.appendChild(document.createElement("br"));

            //item size

            itemsize = document.createElement("span");
            itemsize.className = "w3-small"
            itemsize.innerHTML = 'tamanho: ' + obj.tamanho;
            iteminfodiv.appendChild(itemsize);

            // break line
            iteminfodiv.appendChild(document.createElement("br"));

            //item itemprice

            itemprice = document.createElement("span");
            itemprice.className = "w3-small"
            itemprice.innerHTML = 'R$' + obj.valor;
            iteminfodiv.appendChild(itemprice);
            carticonnumber = cartcounter;
            carticon = document.getElementById("bagicon")
            carticon.innerHTML = cartcounter;
            carticon.style.display = "";

        }

        //frete total price

          
  
        

        totalprice = document.createElement("p");
        totalprice.className = "w3-row w3-right w3-large";
        totalprice.innerHTML = 'total: R$' + carttotal;
        carthtml.appendChild(totalprice);



                //frete total price 2
/*
                spanprice = document.getElementById("totalprice2");
                fretetipo2 = document.createElement("div");
                fretetipo2.className = "w3-row";
                fretetipo2.innerHTML = '<input type="radio" id="fretegratis" name="frete" value="gratis" checked><label for="fretegratis" class="w3-padding">frete grátis (SEDEX)</label>';
                spanprice.appendChild(fretetipo2);
                
                
        
        
                totalprice2 = document.createElement("p");
                totalprice2.className = "w3-row bold w3-right w3-large";
                totalprice2.innerHTML = 'total: R$' + carttotal;
                console.log("add price");
                spanprice.appendChild(totalprice2);

 
*/



    }


}
/// cart render end


function goModal(slide) {
    img = slide.src;
    document.getElementById('modalimg').src = img;
    document.getElementById('modalbox').style.display = 'block'
}

function showSlide(slide) {
    document.getElementById('slide').src = slide.src;
    setActiveThumb();
}

function nextSlide() {
    var thumbs = document.getElementsByClassName("thumb");
    var atual = document.getElementById('slide').src;
    for (i = 0; i < thumbs.length; i++) {
        if (thumbs[i].src == atual) {
            var proximo = i + 1;
            if (proximo > (thumbs.length - 1)) {
                document.getElementById('slide').src = thumbs[0].src;
            } else {
                document.getElementById('slide').src = thumbs[i + 1].src;
            }
        }
    }
    setActiveThumb();
}

function prevSlide() {
    var thumbs = document.getElementsByClassName("thumb");
    var atual = document.getElementById('slide').src;
    for (i = 0; i < thumbs.length; i++) {
        if (thumbs[i].src == atual) {
            var proximo = i - 1;
            if (proximo < 0) {
                document.getElementById('slide').src = thumbs[thumbs.length - 1].src;
            } else {
                document.getElementById('slide').src = thumbs[i - 1].src;
            }
        }
    }
    setActiveThumb();
}



function setActiveThumb() {
    var atual = document.getElementById('slide').src;
    var thumbs = document.getElementsByClassName("thumb");
    for (i = 0; i < thumbs.length; i++) {
        if (thumbs[i].src == atual) {
            thumbs[i].classList.add("active");
        } else
            thumbs[i].classList.remove("active");
    }

}

function renderSizeButtons() {
    if (estoquePeq < 1) {
        document.getElementById('ptip').innerHTML = "esgotado";
        document.getElementById('pbtn').classList.remove("w3-disabled");
        document.getElementById('pbtn').classList.add("w3-disabled");
    } else {
        document.getElementById('pbtn').classList.remove("w3-disabled");
        document.getElementById('ptip').innerHTML = estoquePeq + " disponivel";
    }

    if (estoqueMed < 1) {
        document.getElementById('mtip').innerHTML = "esgotado";
        document.getElementById('mbtn').classList.remove("w3-disabled");
        document.getElementById('mbtn').classList.add("w3-disabled");
    } else {
        document.getElementById('mbtn').classList.remove("w3-disabled");
        document.getElementById('mtip').innerHTML = estoqueMed + " disponivel";
    }

    if (estoqueGra < 1) {
        document.getElementById('gtip').innerHTML = "esgotado";
        document.getElementById('gbtn').classList.remove("w3-disabled");
        document.getElementById('gbtn').classList.add("w3-disabled")
    } else {
        document.getElementById('gbtn').classList.remove("w3-disabled");
        document.getElementById('gtip').innerHTML = estoqueGra + " disponivel";
    }


}

function calculaEstoque(sku) {

    for (i = 0; i < carrinho.length; i++) {
        obj = JSON.parse(carrinho[i]);
        if (obj.sku == sku) {
            switch (obj.tamanho.toLowerCase()) {
                case 'p':
                    estoquePeq -= 1
                    break;
                case 'm':
                    estoqueMed -= 1
                    break;
                case 'g':
                    estoqueGra -= 1
                    break;
                case 'u':
                    estoqueUni -= 1
                    break;
                default:
                    console.log("size not set: " + obj.tamanho.toLowerCase())
            }
        }
    }

    renderSizeButtons();

}

function estoqueLoad(estoqueJson) {
        estoquePeq = estoqueJson.p;
        estoqueMed = estoqueJson.m;
        estoqueGra = estoqueJson.g;
        estoqueUni = estoqueJson.u;
        if (carrinho.length > 0) {
            calculaEstoque(estoqueJson.sku)
        } else {
            renderSizeButtons();
        }
    
}

function getEstoque(sku) {
    if (sku) {

    
    if ( ! sku.includes('sku')) {

    
    fetch(estoqueurl)
        .then(response => response.json())
        .then(data => {
                estoqueJson = data[sku]
                estoqueLoad(estoqueJson)

            }

        )
        .catch(error => console.error(error))
    }
}
}


function addSuccess() {
    // Get the snackbar DIV
    var x = document.getElementById("snackbar");

    // Add the "show" class to DIV
    x.classList.add("show");

    // After 3 seconds, remove the show class from DIV
    setTimeout(function() {
        x.classList.remove("show");
    }, 3000);

    addbuttom = document.getElementById("btnadd");
    addbuttom.removeAttribute("data-tamanho");
    addbuttom.classList.add("w3-disabled");

    var sizebuttons = document.getElementsByClassName("sizebutton");
    for (i = 0; i < sizebuttons.length; i++) {

        sizebuttons[i].classList.remove("selected");
    }
}


// Form save:

// form.js
const formId = "formulariodecontato"; // ID of the form
const saveButton = document.querySelector("#save"); // select save button
let form = document.getElementById("formulariodecontato"); // select form
let formElements = form.elements; // get the elements in the form


const getFormData = () => {
    let data = {
        [formId]: {}
    };
    for (const element of formElements) {
        if (element.name.length > 0) {
            data[formId][element.name] = element.value;
        }
    }
    return data;
};


const populateForm = () => {
    if (localStorage.getItem(formId)) {
        const savedData = JSON.parse(localStorage.getItem(formId)); // get and parse the saved data from localStorage
        for (const element of formElements) {
            if (element.name in savedData) {
                if (element.id) {

                }

                element.value = savedData[element.name];
            }
        }

    } else {

    }
};

document.onload = populateForm(); 

window.onunload = event => {
    data = getFormData();
    localStorage.setItem(formId, JSON.stringify(data[formId]));
};



// Checkout:

function makeId(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}




function checkoutGo() {
    showLoader();
    var cartcounter = 0;
    var itemsselecionados = [];

    for (i = 0; i < carrinho.length; i++) {
        obj = JSON.parse(carrinho[i]);
        cartcounter += 1;
        itemsselecionados[i] = {};
        itemsselecionados[i]['Name'] = obj.nome;
        itemsselecionados[i]['Description'] = obj.tamanho;
        itemsselecionados[i]['UnitPrice'] = null
        itemsselecionados[i]['Quantity'] = 1;
        itemsselecionados[i]['Type'] = "Asset";
        itemsselecionados[i]['Sku'] = obj.sku;
        itemsselecionados[i]['Weight'] = 1;
    }

    orderdata = {
        "OrderNumber": Date.now() + makeId(8),
        "SoftDescriptor": "pedido de anafonsaca.com.br",
        "Cart": {
            "Discount": null,
            "Items": itemsselecionados
        },
        "Shipping": {
            "SourceZipCode": null,
            "TargetZipCode": document.getElementById("formcep").value.replace(/\D/g, ""),
            "Type": "Free",
            "Services": null,
            "Address": {
                "Street": document.getElementById("formrua").value.toUpperCase(),
                "Number": document.getElementById("formnumero").value,
                "Complement": document.getElementById("formcomplemento").value.toUpperCase(),
                "District": document.getElementById("formbairro").value.toUpperCase(),
                "City": document.getElementById("formcidade").value.toUpperCase(),
                "State": document.getElementById("formestado").value.toUpperCase()
            }
        },
        "Customer": {
            "Identity": document.getElementById("formcpf").value.replace(/\D/g, ""),
            "FullName": document.getElementById("formnome").value.toUpperCase(),
            "Email": document.getElementById("formemail").value.toUpperCase(),
            "Phone": document.getElementById("formtelefone").value
        },
        "Settings": null
    }

    var postDetails = {
        method: 'POST',
        body: JSON.stringify(orderdata),
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        },
        mode: "cors"
    };

    fetch( checkoutapi, postDetails )
        .then( response =>
        {
            if ( response.status !== 200 )
            {
                console.log( 'Looks like there was a problem. Status Code: ' +
                    response.status );
                   // window.alert("time out, por favor tente novamente")
                    window.location.reload(true);
                return;
            }
            return response.json();
        }
        )
        .then( myJson =>
        {
 
            console.log(myJson);
            if (myJson.includes("https://")) {
                esvaziaCarrinho();
              console.log("redirecionando para o checkout:")
              window.location.href = myJson;
            }
            
        } )
        .catch( err =>
        {
          console.log( 'Fetch Error :-S', err );
          esvaziaCarrinho();
          window.alert("estoque indisponível, por favor tente novamente");
          window.location.reload(true);
        } );

        
};


function unfoldAll() {




    var x = document.getElementsByClassName("foldable");
var i;
for (i = 0; i < x.length; i++) {
  x[i].style.maxHeight = null;
}
}

function dropInfo(id) {
    document.getElementById('suacomprabuttom').classList.remove('color-ba8671');
      document.getElementById('entregabuttom').classList.remove('color-d3e4f5');
      document.getElementById('checkoutbuttom').classList.remove('color-e6e1d8');
    switch(id) {
        case 'suacompra':
            document.getElementById('suacomprabuttom').classList.add('color-ba8671');
          break;
          case 'dadosparaentrega':
            document.getElementById('entregabuttom').classList.add('color-d3e4f5');
          break;
          case 'pagamentos':
            document.getElementById('checkoutbuttom').classList.add('color-e6e1d8');
          break;
      }


    unfoldAll()
    var x = document.getElementById(id);

    if (x.style.maxHeight) {
        x.style.maxHeight = null;
      } else {
        x.style.maxHeight = x.scrollHeight + "px";
      } 

  }

  function dropInfoOpen(id) {
    unfoldAll()
    var x = document.getElementById(id);
    x.style.maxHeight = x.scrollHeight + "px";
  }



  function showLoader() {
    document.getElementById('loadermodal').style.display = 'block'
  }


  var scrolleds = 0
  function magicText() {
    scrolleds  += 1
    if ( scrolleds > 40 && scrolleds < 80 ) {
        banner = document.getElementById("banner");
        banner.innerHTML = "joy motifs - summer collection";
        banner.classList.remove("bannertext");
        banner.classList.add("bannertextmid");
        
    }

    if ( scrolleds > 121 && scrolleds < 200 ) {
        banner = document.getElementById("banner");
        banner.innerHTML = "ana fonsaca";
        banner.classList.remove("bannertextmid");
        banner.classList.add("bannertext");
        
    }

    if ( scrolleds > 201 && scrolleds < 280 ) {
        banner = document.getElementById("banner");
        banner.innerHTML = "joy motifs - summer collection";
        banner.classList.remove("bannertext");
        banner.classList.add("bannertextmid");
        
    }

    if ( scrolleds > 281 && scrolleds < 300 ) {
        banner = document.getElementById("banner");
        banner.innerHTML = "ana fonsaca";
        banner.classList.remove("bannertextmid");
        banner.classList.add("bannertext");
        
    }

  }

// INIT:

cartRender();

document.getElementById("formulariodecontato").addEventListener("submit", checkoutGo);

document.getElementById("shopCart").addEventListener('click', function (e) {
    if (e.target.id == "shopCart") {
        toggleCart();
    }
      }, false);



 
    
    
    