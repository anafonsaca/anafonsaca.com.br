#!/usr/bin/env bash




if ! json="$(python3 cadastro-sheets-json.py)"; then
exit 1
fi

mkdir ../.temp/ 2>/dev/null
echo "$json" > ../.temp/catalogo.json

if [[ "$1" != "x" ]]; then

if ! rclone sync anafonshop:'PASTAS MACBOOK'/'1. Moda'/'7. ANA FONSACA '/'3. Site'/'1. Fotos site' ../img --verbose; then
exit 1
fi

cd ../img || exit
pwd
for dir in *; do

if cd "$dir"; then
pwd
for i in *.jpg; do
printf "%s" "${i%.*}.webp..."
if convert "$i" -resize 1920x1920\> "${i%.*}".webp; then
convert "$i" -resize 1280x1280\> "${i%.*}"-grid.webp
#convert "$i" -resize 120x120\> "${i%.*}"-thumb.webp
echo "ok"
trash "$i"
fi
done
cd ..
fi
done

cd ../generator || exit
pwd
fi

###index:
export titulo='joy motifs - summer collection'


{ echo "cat <<HEREDOC"
  cat head.html
  cat shopcart.html
  cat indexmid.html
  cat footer.html
  #echo "HEREDOC"
} | sh > ../index.html

#############################


###shop:
export titulo='shop'

{ echo "cat <<HEREDOC"
  cat head.html
  cat shopcart.html
  cat grid-mid.html
  #echo "HRHRHRHR"
} | sh > ../shop/index.html



gridcounter=0

while read -r key; do 
#while read -r atributtes; do
#echo "$atributtes"
#done < <(jq ."$sku" <<< "$json" | jq 'keys'[] -r)

export sku="$key"
echo "----------------"
echo "$sku"
echo "----------------"
export titulo=$(jq -r ."$sku".titulo <<< "$json")
export valor=$(jq -r ."$sku".preco <<< "$json")
export descricao=$(jq -r ."$sku".descricao <<< "$json")
export composicao=$(jq -r ."$sku".composicao <<< "$json")
export estoque=$(jq -r ."$sku".estoque <<< "$json")
export relacionados=$(jq -r ."$sku".relacionados <<< "$json")
export cor=$(jq -r ."$sku".cor <<< "$json")
export tag=$(jq -r ."$sku".tag <<< "$json")

if [[ -n "$tag" ]]; then
export precoativo="invisivel"
else
export precoativo=""
fi

export parcelamento=12
export parcela=$(awk -v val="$valor" -v par="$parcelamento" -v OFMT="%5.2f%" BEGIN'{ print (val / par)}')
export url=${titulo// /-}





echo "titulo: $titulo"
echo "valor: $valor"
echo "em ${parcelamento}x de $parcela"
echo "descricao: $descricao"
echo "composicao: $composicao"
echo "estoque: $estoque"
echo "relacionados: $relacionados"
echo "url: /shop/$url"

export imagename="$sku"
if [[ ! -s "../img/$sku/01.webp" ]]; then
echo "aviso: imagem ../img/$sku-01.webp não encontrada! Utilizando mock..."
cp ./img/mocka-01.jpg ../img/$sku/01.jpg
cp ./img/mocka-02.jpg ../img/$sku/02.jpg
cp ./img/mocka-03.jpg ../img/$sku/03.jpg
cp ./img/mocka-04.jpg ../img/$sku/04.jpg
cp ./img/mocka-05.jpg ../img/$sku/05.jpg
cp ./img/mocka-06.mp4 ../img/$sku/06.mp4
fi


if [[ -d ../shop/"$url" ]]; then
if ! trash ../shop/"$url"; then
echo "cannot trash ../shop/$url"
exit 1
fi
fi

if ! mkdir ../shop/"$url"; then
pwd
echo "cannot mkdir"
exit 1
fi

######### product single page ###########

{ echo "cat <<HEREDOC"
  cat head.html
  cat shopcart.html
  cat productpage.html
  cat footer.html
  echo "HEREDOC"
} | sh > ../shop/"$url"/index.html



#cat productfooter.html >> ../shop/"$url"/index.html

########## shop grid item ###############

##grid column (each 2 itens):

 #if [[ $((gridcounter%2)) -eq 0 ]]; then 
#echo '<div class="w3-col l3 s6">' >> '../shop/index.html'
# fi

 { echo "cat <<HEREDOC"
  cat griditem.html
  echo "HEREDOC"
 } | sh > './.gridtemp'

 cat ./.gridtemp >> '../shop/index.html'

 #if [[ ! $((gridcounter%2)) -eq 0 ]]; then 
#echo '</div>' >> '../shop/index.html'
# fi

(( gridcounter ++ ))
##############################



done < <(jq 'keys'[] -r <<< "$json")

### fecha o div caso tenha terminado num grid par ####
 #if [[ $((gridcounter%2)) -eq 0 ]]; then 
#echo '</div>' >> '../shop/index.html'
# fi

cat footer.html >> ../shop/index.html

