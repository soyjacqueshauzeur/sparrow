const dataSets = {
  '1-100': [],
  'binario': [],
  'deck': [],
  'abc': [
    { top: 'A', bottom: 'Abeja' },
    { top: 'B', bottom: 'Ballena' },
    { top: 'C', bottom: 'Cocodrilo' },
    { top: 'D', bottom: 'Delfín' },
    { top: 'E', bottom: 'Elefante' },
    { top: 'F', bottom: 'Flamenco' },
    { top: 'G', bottom: 'Gorila' },
    { top: 'H', bottom: 'Hámster' },
    { top: 'I', bottom: 'Iguana' },
    { top: 'J', bottom: 'Jabalí' },
    { top: 'K', bottom: 'Kiwi (ave)' },
    { top: 'L', bottom: 'León' },
    { top: 'M', bottom: 'Mono' },
    { top: 'N', bottom: 'Nutria' },
    { top: 'Ñ', bottom: 'Ñandú' },
    { top: 'O', bottom: 'Oso' },
    { top: 'P', bottom: 'Pingüino' },
    { top: 'Q', bottom: 'Quetzal' },
    { top: 'R', bottom: 'Rinoceronte' },
    { top: 'S', bottom: 'Serpiente' },
    { top: 'T', bottom: 'Tigre' },
    { top: 'U', bottom: 'Urraca' },
    { top: 'V', bottom: 'Vaca' },
    { top: 'W', bottom: 'Wombat' },
    { top: 'X', bottom: 'Xifóforo (pez de acuario)' },
    { top: 'Y', bottom: 'Yak' },
    { top: 'Z', bottom: 'Zorro' }
  ],
  'cirilico': [
    { top: 'А а', bottom: '/a/' },
    { top: 'Б б', bottom: '/b/' },
    { top: 'В в', bottom: '/v/' },
    { top: 'Г г', bottom: '/ɡ/' },
    { top: 'Д д', bottom: '/d/' },
    { top: 'Е е', bottom: '/je/, /e/' },
    { top: 'Ё ё', bottom: '/jo/' },
    { top: 'Ж ж', bottom: '/ʐ/' },
    { top: 'З з', bottom: '/z/' },
    { top: 'И и', bottom: '/i/' },
    { top: 'Й й', bottom: '/j/' },
    { top: 'К к', bottom: '/k/' },
    { top: 'Л л', bottom: '/ɫ/, /lʲ/' },
    { top: 'М м', bottom: '/m/' },
    { top: 'Н н', bottom: '/n/' },
    { top: 'О о', bottom: '/o/, /ɐ/' },
    { top: 'П п', bottom: '/p/' },
    { top: 'Р р', bottom: '/r/' },
    { top: 'С с', bottom: '/s/' },
    { top: 'Т т', bottom: '/t/' },
    { top: 'У у', bottom: '/u/' },
    { top: 'Ф ф', bottom: '/f/' },
    { top: 'Х х', bottom: '/x/' },
    { top: 'Ц ц', bottom: '/t͡s/' },
    { top: 'Ч ч', bottom: '/t͡ɕ/' },
    { top: 'Ш ш', bottom: '/ʂ/' },
    { top: 'Щ щ', bottom: '/ɕː/' },
    { top: 'Ъ ъ', bottom: '' },
    { top: 'Ы ы', bottom: '/ɨ/' },
    { top: 'Ь ь', bottom: '' },
    { top: 'Э э', bottom: '/e/' },
    { top: 'Ю ю', bottom: '/ju/' },
    { top: 'Я я', bottom: '/ja/' }
  ],
  'cantidades': [
    { top: 'X2', bottom: 'Neque' },
    { top: 'X3', bottom: 'Morza' },
    { top: 'X4', bottom: 'Cucaracha' },
    { top: 'X5', bottom: 'Lagartija' },
    { top: 'X6', bottom: 'Zorro' },
    { top: 'X7', bottom: 'Jirafa' },
    { top: 'X8', bottom: 'Gato' },
    { top: 'X9', bottom: 'Panda' },
    { top: 'X10', bottom: 'Rinoceronte' }
  ],
  'meses': [
    { top: 'Enero', bottom: '❄️ Hielo' },
    { top: 'Febrero', bottom: '💘 Cupido' },
    { top: 'Marzo', bottom: '🌸 Flor' },
    { top: 'Abril', bottom: '☔ Paraguas' },
    { top: 'Mayo', bottom: '🐝 Abeja' },
    { top: 'Junio', bottom: '🎓 Birrete' },
    { top: 'Julio', bottom: '🎆 Fuegos artificiales' },
    { top: 'Agosto', bottom: '🏖️ Playa' },
    { top: 'Septiembre', bottom: '📚 Libro' },
    { top: 'Octubre', bottom: '🎃 Calabaza' },
    { top: 'Noviembre', bottom: '🍂 Hoja' },
    { top: 'Diciembre', bottom: '🎄 Árbol de Navidad' }
  ]
};

const pegWords = {
  '00':'Reir','0':'Aro','1':'Tea','2':'Noe','3':'Amo','4':'Oca','5':'Ley',
  '6':'Oso','7':'Fea','8':'Ucha','9':'Ave','10':'Torre','11':'Teta','12':'Tina',
  '13':'Tomo','14':'Taco','15':'Tela','16':'Tez','17':'Tufo','18':'Techo',
  '19':'Tubo','20':'Nuera','21':'Nido','22':'Niño','23':'Nomo','24':'Naco',
  '25':'Nilo','26':'Nuez','27':'Naife','28':'Nicho','29':'Nube','30':'Mar',
  '31':'Mito','32':'Mono','33':'Mama','34':'Meca','35':'Mulo','36':'Mesa',
  '37':'Mufo','38':'Mecha','39':'Mapa','40':'Corro','41':'Codo','42':'Cuna',
  '43':'Cama','44':'Coco','45':'Cola','46':'Cazo','47':'Café','48':'Coche',
  '49':'Cubo','50':'Lira','51':'Loto','52':'Luna','53':'Lima','54':'Loco',
  '55':'Lulu','56':'Lazo','57':'Elfo','58':'Lucha','59':'Lupa','60':'Suero',
  '61':'Ostia','62':'Zona','63':'Sima','64':'Saco','65':'Sol','66':'Seso',
  '67':'Sofa','68':'Asecho','69':'Sapo','70':'Faro','71':'Foto','72':'Faena',
  '73':'Fama','74':'Foca','75':'Fiel','76':'Fosa','77':'Fofo','78':'Ficha',
  '79':'Fobia','80':'Chorro','81':'Chita','82':'Chino','83':'Chama','84':'Cheque',
  '85':'Chal','86':'Choza','87':'Enchufa','88':'Chacha','89':'Chapa','90':'Burro',
  '91':'Pito','92':'Pino','93':'Puma','94':'Vaca','95':'Bala','96':'Buzo',
  '97':'Bife','98':'Bache','99':'Pipa','100':'Torero'
};
const pegOrder = ['00','0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50','51','52','53','54','55','56','57','58','59','60','61','62','63','64','65','66','67','68','69','70','71','72','73','74','75','76','77','78','79','80','81','82','83','84','85','86','87','88','89','90','91','92','93','94','95','96','97','98','99','100'];
for (const key of pegOrder) {
  dataSets['1-100'].push({ top: key, bottom: pegWords[key] });
}

const deckMatrix = {
  '♥': { A:'Cero', 2:'Cada', 3:'Cano', 4:'Cima', 5:'Caqui', 6:'Cala', 7:'Cese', 8:'Ceja', 9:'Cacho', 10:'Cebo', J:'Coro', Q:'Cono', K:'Cuajo' },
  '♣': { A:'Toro', 2:'Todo', 3:'Tuno', 4:'Timo', 5:'Tique', 6:'Tala', 7:'Tiza', 8:'Tifo', 9:'Toga', 10:'Topo', J:'Tira', Q:'Tuna', K:'Tuco' },
  '♠': { A:'Paro', 2:'Poda', 3:'Pana', 4:'Pomo', 5:'Pique', 6:'Pelo', 7:'Pozo', 8:'Paje', 9:'Pago', 10:'Pavo', J:'Puro', Q:'Poca', K:'Puya' },
  '♦': { A:'Doro', 2:'Dato', 3:'Dona', 4:'Domo', 5:'Duque', 6:'Dólar', 7:'Deseo', 8:'Dije', 9:'Ducha', 10:'Debo', J:'Duro', Q:'Duda', K:'Duelo' }
};
const deckSuits = ['♥','♣','♠','♦'];
const deckRanks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

for (const s of deckSuits) {
  for (const r of deckRanks) {
    dataSets['deck'].push({ top: r + s, bottom: deckMatrix[s][r] });
  }
}
