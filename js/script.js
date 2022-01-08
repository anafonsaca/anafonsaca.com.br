//Settings:
var checkoutapi = 'https://llbdtlkt95.execute-api.us-east-1.amazonaws.com/prod/pagarmeorder';
var estoqueurl = 'https://anafonsaca.s3.amazonaws.com/estoque.json?nocache=' + Date.now().toString().slice(0, 8) + '00'
var cepdeorigem = 88330786;


var carrinho = [];
var carticonnumber = 0;
var cartopen = false;
var tableopen = false;
var estoqueUni;
var estoquePeq;
var estoqueMed;
var estoqueGra;
var estoqueJson = {};
estoqueJson.p = 1;
estoqueJson.m = 1;
estoqueJson.g = 1;
estoqueJson.u = 1;
var orderdata = {};
var uniqueid;
var carttotal = 0;
var cuidadosopen = false;
var cardholderedited = false;
var statesbrasil;
var phonomaskedbackup;
var auto_fill_street_address = 'street-address'
var auto_fill_district = 'district'
var auto_fill_city = 'city'
var auto_fill_state = 'state'

var whats1 = document.getElementById('whatsappcheckout1')
var whats2 = document.getElementById('whatsappcheckout2')

//var inputemail1 = document.getElementById('email')
//var inputemail2 = document.getElementById('emailconfirmation')
var inputname = document.getElementById('name')
var inputcardholder = document.getElementById('cardHolder')

const formId = "checkoutform"; // ID of the form
var form = document.getElementById(formId); // select form

function getCardFlag(cardnumber) {
    var cardnumber = cardnumber.replace(/[^0-9]+/g, '');

    var cards = {
        visa      : /^4[0-9]{12}(?:[0-9]{3})/,
        master : /^5[1-5][0-9]{14}/,
        diners    : /^3(?:0[0-5]|[68][0-9])[0-9]{11}/,
        amex      : /^3[47][0-9]{13}/,
        discover  : /^6(?:011|5[0-9]{2})[0-9]{12}/,
        hipercard  : /^(606282\d{10}(\d{3})?)|(3841\d{15})/,
        elo        : /^((((636368)|(438935)|(504175)|(451416)|(636297))\d{0,10})|((5067)|(4576)|(4011))\d{0,12})/,
        jcb        : /^(?:2131|1800|35\d{3})\d{11}/,
        aura      : /^(5078\d{2})(\d{2})(\d{11})$/
    };

    for (var flag in cards) {
        if(cards[flag].test(cardnumber)) {
            document.getElementById("cardNumber").style.backgroundImage = "url('/assets/" + flag + ".png" + "')";
            if (flag == 'amex') {
                document.getElementById('cardCsc').setAttribute('maxlength',4)
            }
     
        }
    }
}






/////////////////////////////// cep-entrega /////////////////////////



function meu_callback(conteudo) {
    if (!("erro" in conteudo)) {
        //Atualiza os campos com os valores.
        document.getElementById(auto_fill_street_address).value = (conteudo.logradouro).toLowerCase();
        document.getElementById(auto_fill_district).value = (conteudo.bairro).toLowerCase();
        document.getElementById(auto_fill_city).value = (conteudo.localidade).toLowerCase();

        //uf dropdown
        var entregauf = (conteudo.uf).toUpperCase();

        var objSelect = document.getElementById(auto_fill_state);
        setSelectedValue(objSelect, entregauf);

    } //end if.
  
}



function setSelectedValue(selectObj, valueToSet) {

    for (var i = 0; i < selectObj.options.length; i++) {

        if (selectObj.options[i].value == valueToSet) {

            selectObj.options[i].selected = true;
            return;
        }
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

            //Cria um elemento javascript.
            var script = document.createElement('script');

            //Sincroniza com o callback.
            script.src = 'https://viacep.com.br/ws/' + cep + '/json/?callback=meu_callback';

            //Insere script no documento e carrega o conteúdo.
            document.body.appendChild(script);

        } //end if.
        
    } //end if.

};


function fimDoCep(valor, selectstreet, selectdistrict, selectcity, selectstate) {

    if (valor.length == 9) {
        auto_fill_street_address = selectstreet;
        auto_fill_district = selectdistrict;
        auto_fill_city = selectcity;
        auto_fill_state = selectstate;
        pesquisacep(valor)
    }
}


///////////////////////////////////////////////////////////

function cardHolderNameCopy() {
    if (! cardholderedited) {
inputcardholder.value = inputname.value;
    }
}

/*
function confirmEmail() {
if (inputemail1.value.toLowerCase() != inputemail2.value.toLowerCase()) {
inputemail2.classList.add("w3-border-red");
} else {
    inputemail2.classList.remove("w3-border-red");
    document.getElementById('emailwarning').style.display = 'none';
}
}
*/

function fimDoNumero(valor) {
    if (valor.length > 16) {
        getCardFlag(valor)
    }
}

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

function toggleCuidados () {

    cuidadosinfo = document.getElementById("cuidadospeca");
    
    if (cuidadosopen) {
        cuidadosopen = false;
    cuidadosinfo.style.display = "none";
    } else {
        cuidadosopen = true;
    cuidadosinfo.style.display = "block";
    }
    }

function toggleCart() {
    carticon = document.getElementById("bagicon"); 

    shopcart = document.getElementById("shopCart");
    pagecontent = document.getElementById("pagecontent");

    if (cartopen) {
        cartopen = false;
        shopcart.style.display = "none";

    
     

    } else {
        cartopen = true;
        shopcart.style.display = "block";


    }
   
    cartRender()
}



// var size = null; delete?

var carrinhostored = localStorage.getItem("carrinho");
if (carrinhostored != null) {
    carrinho = JSON.parse(carrinhostored);
}




function setSize(size) {
    if (!size.classList.contains('w3-disabled')) {
        if (size.innerHTML == 'único') {
            tamanho = 'u'
        } else {
            tamanho = size.innerHTML;
        }
        
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
        skuadded = product.dataset.sku;
        fbq('track', 'AddToCart',{contents: {skuadded},});
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
    carttotal = 0;  //declarada global para checkout ver
    var cartcounter = 0;

    butoes = document.getElementById("checkoutbuttom");
    var checkoutcart = document.getElementById("checkoutcart");
    if(checkoutcart)
    carthtml = document.getElementById("checkoutcart");
    else
    carthtml = document.getElementById("carthtml");

    carthtml.innerHTML = "";
    //document.getElementById("totalprice2").innerHTML = '';
    document.getElementById("bagstatus").innerHTML = "";

    if (carrinho.length == 0) {
        carticon = document.getElementById("bagicon");  
        if (carticon){carticon.innerHTML = ''};
        if (carticon){carticon.style.display = "none"};


        butoes.style.display = "none";


        bagstatus = document.getElementById("bagstatus");
        emptydiv = document.createElement("div");
        emptydiv.className = "w3-display-container w3-margin-bottom empty";
        bagstatus.appendChild(emptydiv);

        emptytxt = document.createElement("p");
        emptytxt.className = "w3-display-middle";
        emptytxt.innerHTML = "nenhum item selecionado";
        emptydiv.appendChild(emptytxt);
      
        

        // document.getElementById("bagbuttom").style.display = "none";
    } else {

    
        butoes.style.display = "";



        var whatsstring = "Olá, eu gostaria de realizar o checkout referente aos itens: "

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
            if (carticon){carticon.innerHTML = cartcounter};
            if (carticon){carticon.style.display = ""};

            whatsstring += ' - ' + obj.nome + ' [tamanho: ' + obj.tamanho + '] ' + ' [sku:' + obj.sku + '],'

        }

        if (whats1) {
            whats1.href = 'https://wa.me/5541991595808?text=' + whatsstring
        }

        if (whats2) {
            whats2.href = 'https://wa.me/5541991595808?text=' + whatsstring
        }

        //frete total price

          
  
        

        totalprice = document.createElement("p");
        totalprice.className = "w3-row w3-right w3-large";
        totalprice.innerHTML = 'total: R$' + carttotal;
        carthtml.appendChild(totalprice);

    }

    calculaParcelas(carttotal);
}

function calculaParcelas(total) {
parcelaselector = document.querySelector("#installments");
if (parcelaselector) {
    Array.from(parcelaselector.options).forEach(function(option_element) {
   if (total > 0) {
        if (option_element.value == 1) {
            option_element.text = Number(((total / option_element.value)).toFixed(2)).toLocaleString('pt-br',{style: 'currency', currency: 'BRL'}) + ' à vista'
        } else {
        option_element.text = option_element.value + 'x de ' + Number(((total / option_element.value)).toFixed(2)).toLocaleString('pt-br',{style: 'currency', currency: 'BRL'}) + ' (sem juros)';
        }
    } else {
        option_element.text = option_element.value + 'x';
    }
    });
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
    sizebtns = document.getElementById('sizes');
    if (sizebtns) {

    if (estoqueUni > 0) {
        sizebtns.style.display = "none";
        document.getElementById('uniqsize').style.display = "block";
        document.getElementById('ubtn').classList.remove("w3-disabled");
        document.getElementById('utip').innerHTML = estoqueUni + " disponivel";
    } else {

    
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

function checkoutGo(event)  {
    event.preventDefault();
/*
    if (inputemail2) {
    if (inputemail1.value.toLowerCase() != inputemail2.value.toLowerCase()) {
        document.getElementById('emailwarning').style.display = 'block';
        confirmEmail();
        inputemail2.focus();
        return false;
    }
}
*/

if (document.getElementById('website').value.length != 0) {
    console.log('spam');
    return
}

duplicaEndereco(document.getElementById('deliveryequalbill'), true);

    showLoader();
    var cartcounter = 0;
    var itemsselecionados = [];
    var skus = [];

    for (i = 0; i < carrinho.length; i++) {
        obj = JSON.parse(carrinho[i]);
        cartcounter += 1;
        itemsselecionados[i] = {};
        itemsselecionados[i]['Name'] = obj.nome;
        itemsselecionados[i]['Description'] = obj.tamanho;
        itemsselecionados[i]['UnitPrice'] = obj.valor
        itemsselecionados[i]['Quantity'] = '1';
        itemsselecionados[i]['Type'] = "Asset";
        itemsselecionados[i]['Sku'] = obj.sku;
        itemsselecionados[i]['Weight'] = '1';
        skus[i] = obj.sku;
    }

    let miniId = makeId(8);
    orderid = miniId + '_' + Date.now();

    fbq('track', 'InitiateCheckout',{content_ids: skus, order_id: orderid});


    const data = new FormData(event.target);
    const value = Object.fromEntries(data.entries());
// value.topics = data.getAll("topics");
    value.items = itemsselecionados;
    value.OrderNumber = orderid;
    value.SoftDescriptor = miniId;
    value.cardNumber = value.cardNumber.replace(/\D/g, "");

    doctype = CNPJorCPFisValid(value.document);
    if (doctype == 'cnpj') {
        value.buyertype = 'company'
    } else {
        value.buyertype = 'individual'
    }
    value.phonecountry = document.getElementById('countryname').options[document.getElementById('countryname').selectedIndex].dataset.countrycode;
    value.phoneareacode = value.phone.replace(/\D/g, "").substring(0, 2);
    value.phone = value.phone.replace(/\D/g, "").substring(2);
    value.deliveryphone = value.deliveryphone.replace(/\D/g, "");
    value.document = value.document.replace(/\D/g, "");
    value.postalcode = value.postalcode.replace(/\D/g, "");
    value.deliverypostalcode = value.deliverypostalcode.replace(/\D/g, "");
    value.total = carttotal.toString();

    var postDetails = {
        method: 'POST',
        body: JSON.stringify(value),
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
                    console.log("O servidor de cobrança não respondeu (" + response.status + "),  tente novamente. Se o erro persistir, por favor entre em contato via whatsapp onde a nossa equipe poderá fianlizar o seu checkout pessoalmente.")
                    //window.location.reload(true);
                    paymentFailed();
                return;
            }
            return response.json();
        }
        )
        .then( myJson =>
        {
            console.log(myJson);
            if (myJson.status == 'paid') {
                paymentSuccess(myJson.order);
            } else if (myJson.status == 'semestoque') {

                estoqueFailed();
            } else {
                paymentFailed();
            }
            
        } )
        
};

function retornoteste(palavra, ordername) {
    console.log(palavra)
    showLoader();
if (palavra == 'paid') {
    console.log('pago')
    paymentSuccess(ordername);
} else {
    if (palavra == 'semestoque') {
        console.log('no estoq')
    estoqueFailed();
} else {
    console.log('falha padrao')
    paymentFailed();
}
}
}


function paymentSuccess(ordername) {
    document.getElementById('loadersymbol').style.display = 'none';
    document.getElementById('loadersuccess').style.display = 'block';
    orderlink = '/pedido?' + ordername
    document.getElementById('pedidoinfolink').setAttribute('href', orderlink);
    

}

function paymentFailed() {
    document.getElementById('loadersymbol').style.display = 'none';
    document.getElementById('loaderfail').style.display = 'block';
}

function estoqueFailed() {
    esvaziaCarrinho()
    document.getElementById('loadersymbol').style.display = 'none';
    document.getElementById('loaderestoquefail').style.display = 'block';
}

function closeLoader() {
    document.getElementById('loadersymbol').style.display = 'block';
    document.getElementById('loaderfail').style.display = 'none';
    document.getElementById('loadermodal').style.display = 'none'
    document.getElementById('loaderestoquefail').style.display = 'none';
    document.getElementById('loadersuccess').style.display = 'none';
}


function anotherCountry(country, stateelement, phoneelement, postalelement) {

    
    if (country != 'BR') {

                //frete type
                document.getElementById('intfrete').innerHTML = 'Global Shipping (With Tracking) - FREE'
                //doc placeholder
                document.getElementById('document').placeholder = 'PASSPORT';

                //br postalcode input backup
                postalmasked = document.getElementById(postalelement);
                if (postalmasked.dataset.country && postalmasked.dataset.country == 'BR') {
                    postalmaskedbackup = postalmasked.cloneNode(true);
                    }
                    postalmasked.remove()
                    postalinput = document.createElement("input");
                    postalinput.className = "w3-input w3-border w3-round-large w3-small";
                    postalinput.type="tel";
                    postalinput.name=postalelement;
                    postalinput.id=postalelement;
                    spanplace = postalelement + 'div'
                    document.getElementById(spanplace).appendChild(postalinput);;

        //br phono input backup
        phonemasked = document.getElementById(phoneelement);
        if (phonemasked.dataset.country && phonemasked.dataset.country == 'BR') {
            phonemaskedbackup = phonemasked.cloneNode(true);
            }
            phonemasked.remove()
            phoneinput = document.createElement("input");
            phoneinput.className = "w3-input w3-border w3-round-large w3-small";
            phoneinput.type="tel";
            phoneinput.name=phoneelement;
            phoneinput.id=phoneelement;
            spanplace = phoneelement + 'div'
            document.getElementById(spanplace).appendChild(phoneinput);

        //br state input backup
        selector = document.getElementById(stateelement);
        if (selector.dataset.country == 'BR') {
        statesbrasil = selector.cloneNode(true);
        }
        selector.remove()
        stateinput = document.createElement("input");
        stateinput.className = "w3-input w3-border w3-round-large w3-small";
        stateinput.type="text";
        stateinput.name=stateelement;
        stateinput.id=stateelement;
        selectah = stateelement + 'selector'
        document.getElementById(selectah).appendChild(stateinput);
    } else {

              //frete type
              document.getElementById('intfrete').innerHTML = 'frete grátis (SEDEX)'
                        //doc placeholder
                        document.getElementById('document').placeholder = 'CPF ou CNPJ';
                //br postal input restore
                if (postalmaskedbackup) {
                    document.getElementById(postalelement).remove()
                    spanplace = postalelement + 'div'
                    document.getElementById(spanplace).appendChild(postalmaskedbackup);
                }

        //br phone input restore
        if (phonemaskedbackup) {
            document.getElementById(phoneelement).remove()
            spanplace = phoneelement + 'div'
            document.getElementById(spanplace).appendChild(phonemaskedbackup);
        }
        //br state input restore
        if (statesbrasil) {
            document.getElementById(stateelement).remove()
            selectah = stateelement + 'selector'
            document.getElementById(selectah).appendChild(statesbrasil);
        }
    }


}


  function showLoader() {
    document.getElementById('loadermodal').style.display = 'block'
  }


  var scrolleds = 0
  

  function isValidCPF(cpf) {
    if (typeof cpf !== 'string') return false
    cpf = cpf.replace(/[^\d]+/g, '')
    if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false
    cpf = cpf.split('')
    const validator = cpf
        .filter((digit, index, array) => index >= array.length - 2 && digit)
        .map( el => +el )
    const toValidate = pop => cpf
        .filter((digit, index, array) => index < array.length - pop && digit)
        .map(el => +el)
    const rest = (count, pop) => (toValidate(pop)
        .reduce((soma, el, i) => soma + el * (count - i), 0) * 10) % 11 % 10
    return !(rest(10,2) !== validator[0] || rest(11,1) !== validator[1])
}


//Facebook Pixel Code

  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '613123119936316');
  fbq('track', 'PageView');
  








// FORMS

const mask = {
    cpf(value) {
      return value
        .replace(/\D/g, '') // aceita somente caracteres numero.
        .replace(/(\d{3})(\d)/, '$1.$2') // () => permite criar grupos de captura.
        .replace(/(\d{3})(\d)/, '$1.$2') // $1, $2, $3 ... permite substituir a captura pela propria captura acrescida de algo
        .replace(/(\d{3})(\d{2})/, '$1-$2') // substitui '78910' por '789-10'.
        
    },
  
    cnpj(value) {
      return value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
    },
  
    phone(value) {
      return value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) - $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3')
        .replace(/(\d{4})\d+?$/, '$1');
    },
  
    cep(value) {
      return value
        .replace(/\D/g, '')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{3})\d+?$/, '$1');
    },
  
    cartao(value) {
      return value
        .replace(/\D/g, '')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
    },
  };
  

  
  
 
  

  
function focusDiv(card) {
 var els = document.getElementsByClassName("focuseable")
 Array.prototype.forEach.call(els, function(el) {
    if ( el.id == card.id ) {
        el.classList.replace('w3-card-4', 'w3-card');
    } else {
        el.classList.replace('w3-card', 'w3-card-4'); 
    }
});

let formElements = form.elements; // get the elements in the form


const getFormData = () => {
    let data = {
        [formId]: {}
    };
    for (const element of formElements) {
        
        if (element.name.length > 0 && ! element.classList.contains('dontsave')) {
            data[formId][element.name] = element.value;
        } 
    }
    return data;
};

data = getFormData();
localStorage.setItem(formId, JSON.stringify(data[formId]));
}

function duplicaEndereco(checkbox, savedelivery) {
    if (checkbox.checked) {
        document.getElementById("formentrega").style.display = 'none';
        var deliverrequired = document.getElementsByClassName("deliveryform");
        for (var i = 0; i < deliverrequired.length; i++) {
            if (savedelivery) {
                deliverrequired.item(i).value = document.getElementById(deliverrequired.item(i).name.replace('delivery','')).value;
            }

            deliverrequired.item(i).required = false;
    }
    } else {
        document.getElementById("formentrega").style.display = 'block';

    var deliverrequired = document.getElementsByClassName("deliveryform");
    for (var i = 0; i < deliverrequired.length; i++) {
        deliverrequired.item(i).required = true;
}
    }
}

//////////////////////////////////// INIT:

cartRender();

// FORMULARIO SAVE and BUTOM LISTERNER


if (form) {

form.addEventListener("submit", checkoutGo);

let formElements = form.elements; // get the elements in the form


const getFormData = () => {
    let data = {
        [formId]: {}
    };
    for (const element of formElements) {
        
        if (element.name.length > 0 && ! element.classList.contains('dontsave')) {
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

    } 
};
document.onload = populateForm(); 



window.onunload = event => {
    data = getFormData();
    localStorage.setItem(formId, JSON.stringify(data[formId]));
};

}
//



cartmodal = document.getElementById("shopCart")
if (cartmodal) {


cartmodal.addEventListener('click', function (e) {
    if (e.target.id == "shopCart") {
        toggleCart();
    }
      }, false);

    }



    function CNPJorCPFisValid(cpf_cnpj) {
        if (cpf_cnpj.replace(/[^\d]+/g, "").length == 11){
            var strCPF = cpf_cnpj.replace(/[^\d]+/g, "");
            var Soma;
            var Resto;
            Soma = 0;
            if (strCPF == "00000000000") return false;
    
            for (i=1; i<=9; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (11 - i);
            Resto = (Soma * 10) % 11;
    
            if ((Resto == 10) || (Resto == 11))  Resto = 0;
            if (Resto != parseInt(strCPF.substring(9, 10)) ) return false;
    
            Soma = 0;
            for (i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (12 - i);
            Resto = (Soma * 10) % 11;
    
            if ((Resto == 10) || (Resto == 11))  Resto = 0;
            if (Resto != parseInt(strCPF.substring(10, 11) ) ) return false;
            return 'cpf';
        }else if (cpf_cnpj.replace(/[^\d]+/g, "").length == 14){
            var confirm = cpf_cnpj.replace(/[^\d]+/g, "");
    
            if (confirm.length != 14) return false;
    
            // Elimina CNPJs invalidos conhecidos
            if (
            confirm == "00000000000000" ||
            confirm == "11111111111111" ||
            confirm == "22222222222222" ||
            confirm == "33333333333333" ||
            confirm == "44444444444444" ||
            confirm == "55555555555555" ||
            confirm == "66666666666666" ||
            confirm == "77777777777777" ||
            confirm == "88888888888888" ||
            confirm == "99999999999999"
            )
            return false;
    
            // Valida DVs
            var tamanho = confirm.length - 2;
            var numeros = confirm.substring(0, tamanho);
            var digitos = confirm.substring(tamanho);
            var soma = 0;
            var pos = tamanho - 7;
            var i;
            for (i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
            }
            var resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
            if (resultado != digitos.charAt(0)) return false;
    
            tamanho = tamanho + 1;
            numeros = confirm.substring(0, tamanho);
            soma = 0;
            pos = tamanho - 7;
            for (i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
            }
            resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
            if (resultado != digitos.charAt(1)) return false;
    
            return 'cnpj';
        }
        return false;
    }

