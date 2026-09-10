import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Plus, Check, X, Shuffle, Trash2, BookOpen, Sparkles, Loader2, XCircle, Pencil, RefreshCw, ChevronLeft, Tag, Star, Download, Upload, Settings } from "lucide-react";

const STORAGE_KEY  = "vocab-cards-v2";
const STORAGE_CATS = "vocab-categories-v1";
const POS_OPTIONS  = ["sostantivo","verbo","aggettivo","avverbio","modo di dire","altro"];
const POS_LABEL    = { sostantivo:"sost.", verbo:"v.", aggettivo:"agg.", avverbio:"avv.", "modo di dire":"id.", altro:"" };
const DEFAULT_CATS = [{ id:"cat-fav", name:"Preferiti", color:"#E8A020" }];
const PALETTE      = ["#E07B3F","#6A7FC1","#5AA06A","#9B6BBF","#C1875A","#5AAAB8","#B55C6E","#7A9E3A","#3A7A8A","#8B6F47"];

const PRELOADED_RAW = [{"id": 1900000000000, "en": "It's a date!", "senses": [{"pos": "modo di dire", "translations": ["d'accordo", "ci sto!"]}], "categoryIds": []}, {"id": 1900000000001, "en": "Count me in!", "senses": [{"pos": "modo di dire", "translations": ["ci sto!", "contaci!"]}], "categoryIds": []}, {"id": 1900000000002, "en": "I'm in (usa)", "senses": [{"pos": "modo di dire", "translations": ["ci sto (USA)"]}], "categoryIds": []}, {"id": 1900000000003, "en": "Thanks for contacting me", "senses": [{"pos": "modo di dire", "translations": ["grazie per avermi contattato"]}], "categoryIds": []}, {"id": 1900000000004, "en": "We'll speak later", "senses": [{"pos": "modo di dire", "translations": ["ci sentiamo dopo"]}], "categoryIds": []}, {"id": 1900000000005, "en": "Kind Regards", "senses": [{"pos": "modo di dire", "translations": ["cordiali saluti"]}], "categoryIds": []}, {"id": 1900000000006, "en": "Have a nice day", "senses": [{"pos": "modo di dire", "translations": ["buona giornata"]}], "categoryIds": []}, {"id": 1900000000007, "en": "Cheers (uk)", "senses": [{"pos": "modo di dire", "translations": ["saluti", "grazie (UK)"]}], "categoryIds": []}, {"id": 1900000000008, "en": "Sincerely (formale)", "senses": [{"pos": "modo di dire", "translations": ["distinti saluti (formale)"]}], "categoryIds": []}, {"id": 1900000000009, "en": "Best regards (formale)", "senses": [{"pos": "modo di dire", "translations": ["cordiali saluti (formale)"]}], "categoryIds": []}, {"id": 1900000000010, "en": "With regards (formale)", "senses": [{"pos": "modo di dire", "translations": ["con i migliori saluti (formale)"]}], "categoryIds": []}, {"id": 1900000000011, "en": "With best wishes (formale)", "senses": [{"pos": "modo di dire", "translations": ["con i migliori auguri (formale)"]}], "categoryIds": []}, {"id": 1900000000012, "en": "I hope to hear from you soon", "senses": [{"pos": "modo di dire", "translations": ["spero di sentirti presto"]}], "categoryIds": []}, {"id": 1900000000013, "en": "You're welcome / no problem / with pleasure", "senses": [{"pos": "modo di dire", "translations": ["prego", "non c'è di che", "figurati", "con piacere"]}], "categoryIds": []}, {"id": 1900000000014, "en": "Hey! / What's up? / You alright? / How are you? / Hey dude! (usa)", "senses": [{"pos": "modo di dire", "translations": ["ehi!", "come va?", "ciao (USA informale)"]}], "categoryIds": []}, {"id": 1900000000015, "en": "See you soon! / See you later / See ya / Take care / Catch you later (usa)", "senses": [{"pos": "modo di dire", "translations": ["a presto!", "ci vediamo", "stammi bene", "a dopo (USA)"]}], "categoryIds": []}, {"id": 1900000000016, "en": "ain't = is / are / am not - have / has not (usa)", "senses": [{"pos": "modo di dire", "translations": ["is/are/am not", "have/has not (informale USA)"]}], "categoryIds": []}, {"id": 1900000000017, "en": "Give me some sugar!", "senses": [{"pos": "modo di dire", "translations": ["dammi un bacio!"]}], "categoryIds": []}, {"id": 1900000000018, "en": "What goes around comes around", "senses": [{"pos": "modo di dire", "translations": ["quello che fai prima o poi ti torna indietro"]}], "categoryIds": []}, {"id": 1900000000019, "en": "Beating a dead horse", "senses": [{"pos": "modo di dire", "translations": ["parlare con il muro", "insistere inutilmente"]}], "categoryIds": []}, {"id": 1900000000020, "en": "Where do you stand on this?", "senses": [{"pos": "modo di dire", "translations": ["cosa ne pensi?", "qual è la tua opinione?"]}], "categoryIds": []}, {"id": 1900000000021, "en": "You know where I stand", "senses": [{"pos": "modo di dire", "translations": ["sai cosa ne penso", "conosci la mia posizione"]}], "categoryIds": []}, {"id": 1900000000022, "en": "Say hi to...", "senses": [{"pos": "modo di dire", "translations": ["salutami..."]}], "categoryIds": []}, {"id": 1900000000023, "en": "Hello / Hi / Hey", "senses": [{"pos": "modo di dire", "translations": ["ciao", "salve", "ehi"]}], "categoryIds": []}, {"id": 1900000000024, "en": "Morning / Afternoon / Evening", "senses": [{"pos": "modo di dire", "translations": ["buongiorno", "buon pomeriggio", "buona sera (informali)"]}], "categoryIds": []}, {"id": 1900000000025, "en": "Good Morning / Good Afternoon / Good Evening", "senses": [{"pos": "modo di dire", "translations": ["buongiorno", "buon pomeriggio", "buona sera"]}], "categoryIds": []}, {"id": 1900000000026, "en": "How are you?", "senses": [{"pos": "modo di dire", "translations": ["come stai?", "come sta? (formale)"]}], "categoryIds": []}, {"id": 1900000000027, "en": "How's it going? (slang)", "senses": [{"pos": "modo di dire", "translations": ["come va?"]}], "categoryIds": []}, {"id": 1900000000028, "en": "How are you doing? (Slang)", "senses": [{"pos": "modo di dire", "translations": ["come va?", "come stai? (informale", "come Joey di Friends)"]}], "categoryIds": []}, {"id": 1900000000029, "en": "What's up (with you)?", "senses": [{"pos": "modo di dire", "translations": ["cosa c'è?", "come va? (saluto informale tra amici)"]}], "categoryIds": []}, {"id": 1900000000030, "en": "You alright?", "senses": [{"pos": "modo di dire", "translations": ["stai bene?", "tutto ok? (tipico del nord Inghilterra)"]}], "categoryIds": []}, {"id": 1900000000031, "en": "How have you been?", "senses": [{"pos": "modo di dire", "translations": ["come stai stato?", "come è andata?"]}], "categoryIds": []}, {"id": 1900000000032, "en": "What's new?", "senses": [{"pos": "modo di dire", "translations": ["cosa c'è di nuovo?"]}], "categoryIds": []}, {"id": 1900000000033, "en": "How's life?", "senses": [{"pos": "modo di dire", "translations": ["come va la vita?"]}], "categoryIds": []}, {"id": 1900000000034, "en": "How's everything?", "senses": [{"pos": "modo di dire", "translations": ["come va tutto?"]}], "categoryIds": []}, {"id": 1900000000035, "en": "How are things?", "senses": [{"pos": "modo di dire", "translations": ["come vanno le cose?"]}], "categoryIds": []}, {"id": 1900000000036, "en": "How's your day going?", "senses": [{"pos": "modo di dire", "translations": ["com'è andata la tua giornata?"]}], "categoryIds": []}, {"id": 1900000000037, "en": "How was your day?", "senses": [{"pos": "modo di dire", "translations": ["com'è andata la tua giornata?"]}], "categoryIds": []}, {"id": 1900000000038, "en": "What's going on?", "senses": [{"pos": "modo di dire", "translations": ["che succede?", "cosa sta succedendo?"]}], "categoryIds": []}, {"id": 1900000000039, "en": "How do you do?", "senses": [{"pos": "modo di dire", "translations": ["molto lieto (formale primo incontro)", "si risponde ripetendo la domanda"]}], "categoryIds": []}, {"id": 1900000000040, "en": "Nice to meet you / Pleased to meet you", "senses": [{"pos": "modo di dire", "translations": ["piacere di conoscerti", "lieto di conoscerti"]}], "categoryIds": []}, {"id": 1900000000041, "en": "I'm good/fine/well", "senses": [{"pos": "modo di dire", "translations": ["sto bene"]}], "categoryIds": []}, {"id": 1900000000042, "en": "Not too bad", "senses": [{"pos": "modo di dire", "translations": ["non male"]}], "categoryIds": []}, {"id": 1900000000043, "en": "I'm doing great", "senses": [{"pos": "modo di dire", "translations": ["sto benissimo"]}], "categoryIds": []}, {"id": 1900000000044, "en": "I'm doing well/OK/alright/fine", "senses": [{"pos": "modo di dire", "translations": ["sto bene", "sono a posto"]}], "categoryIds": []}, {"id": 1900000000045, "en": "Couldn't be better/worse", "senses": [{"pos": "modo di dire", "translations": ["non potrebbe andare meglio", "non potrebbe andare peggio"]}], "categoryIds": []}, {"id": 1900000000046, "en": "Pretty good", "senses": [{"pos": "modo di dire", "translations": ["abbastanza bene"]}], "categoryIds": []}, {"id": 1900000000047, "en": "Not (too) bad", "senses": [{"pos": "modo di dire", "translations": ["non (troppo) male"]}], "categoryIds": []}, {"id": 1900000000048, "en": "I've been better", "senses": [{"pos": "modo di dire", "translations": ["ho avuto periodi migliori"]}], "categoryIds": []}, {"id": 1900000000049, "en": "Could be worse", "senses": [{"pos": "modo di dire", "translations": ["potrebbe andare peggio"]}], "categoryIds": []}, {"id": 1900000000050, "en": "I'm so-so", "senses": [{"pos": "modo di dire", "translations": ["così così"]}], "categoryIds": []}, {"id": 1900000000051, "en": "Not great", "senses": [{"pos": "modo di dire", "translations": ["non benissimo"]}], "categoryIds": []}, {"id": 1900000000052, "en": "I'm feeling a bit under the weather", "senses": [{"pos": "modo di dire", "translations": ["mi sento un po' giù"]}], "categoryIds": []}, {"id": 1900000000053, "en": "I'm really busy at the moment", "senses": [{"pos": "modo di dire", "translations": ["sono molto occupato al momento"]}], "categoryIds": []}, {"id": 1900000000054, "en": "I get it / I got it", "senses": [{"pos": "modo di dire", "translations": ["ho capito", "l'ho preso"]}], "categoryIds": []}, {"id": 1900000000055, "en": "My bad", "senses": [{"pos": "modo di dire", "translations": ["colpa mia", "scusa"]}], "categoryIds": []}, {"id": 1900000000056, "en": "Come again?", "senses": [{"pos": "modo di dire", "translations": ["puoi ripetere?"]}], "categoryIds": []}, {"id": 1900000000057, "en": "What's the damage?", "senses": [{"pos": "modo di dire", "translations": ["quanto costa?", "quanto viene il conto?"]}], "categoryIds": []}, {"id": 1900000000058, "en": "Bummer! / What a bummer / What a pity", "senses": [{"pos": "modo di dire", "translations": ["che peccato!", "che sfiga!"]}], "categoryIds": []}, {"id": 1900000000059, "en": "Something came up", "senses": [{"pos": "modo di dire", "translations": ["c'è stato un imprevisto"]}], "categoryIds": []}, {"id": 1900000000060, "en": "Back to the grind", "senses": [{"pos": "modo di dire", "translations": ["si ritorna al lavoro"]}], "categoryIds": []}, {"id": 1900000000061, "en": "I can't get enough", "senses": [{"pos": "modo di dire", "translations": ["non ne ho mai abbastanza"]}], "categoryIds": []}, {"id": 1900000000062, "en": "Same old same old", "senses": [{"pos": "modo di dire", "translations": ["sempre la stessa solfa", "le solite cose"]}], "categoryIds": []}, {"id": 1900000000063, "en": "You name it", "senses": [{"pos": "modo di dire", "translations": ["e via dicendo", "tutto quello che vuoi", "hai solo l'imbarazzo della scelta"]}], "categoryIds": []}, {"id": 1900000000064, "en": "Ish", "senses": [{"pos": "avverbio", "translations": ["quasi", "più o meno", "sort of"]}], "categoryIds": []}, {"id": 1900000000065, "en": "Long story short", "senses": [{"pos": "modo di dire", "translations": ["per farla breve", "in breve"]}], "categoryIds": []}, {"id": 1900000000066, "en": "In short", "senses": [{"pos": "modo di dire", "translations": ["in breve"]}], "categoryIds": []}, {"id": 1900000000067, "en": "Bite off more than you can chew", "senses": [{"pos": "modo di dire", "translations": ["fare il passo più lungo della gamba", "mordere più di quello che puoi masticare"]}], "categoryIds": []}, {"id": 1900000000068, "en": "Speak your mind", "senses": [{"pos": "modo di dire", "translations": ["dimmi che ne pensi", "di' quello che pensi"]}], "categoryIds": []}, {"id": 1900000000069, "en": "I'm on my way", "senses": [{"pos": "modo di dire", "translations": ["sto arrivando"]}], "categoryIds": []}, {"id": 1900000000070, "en": "Wing it", "senses": [{"pos": "modo di dire", "translations": ["improvvisare", "parlare a braccio"]}], "categoryIds": []}, {"id": 1900000000071, "en": "Help yourself", "senses": [{"pos": "modo di dire", "translations": ["serviti", "fai tu", "prendi pure"]}], "categoryIds": []}, {"id": 1900000000072, "en": "I can tell", "senses": [{"pos": "modo di dire", "translations": ["posso capire", "vedo che", "lo capisco"]}], "categoryIds": []}, {"id": 1900000000073, "en": "Hands down", "senses": [{"pos": "modo di dire", "translations": ["a mani basse", "senza dubbio", "nettamente"]}], "categoryIds": []}, {"id": 1900000000074, "en": "Apples and oranges", "senses": [{"pos": "modo di dire", "translations": ["paragonare cose troppo diverse"]}], "categoryIds": []}, {"id": 1900000000075, "en": "I guess", "senses": [{"pos": "modo di dire", "translations": ["immagino", "suppongo"]}], "categoryIds": []}, {"id": 1900000000076, "en": "No wonder", "senses": [{"pos": "modo di dire", "translations": ["per forza che", "ci credo che", "ovvio!"]}], "categoryIds": []}, {"id": 1900000000077, "en": "You don't say!", "senses": [{"pos": "modo di dire", "translations": ["ma va'!", "ma davvero?!"]}], "categoryIds": []}, {"id": 1900000000078, "en": "The more/bigger/sooner the better", "senses": [{"pos": "modo di dire", "translations": ["più siamo meglio è", "prima è meglio è"]}], "categoryIds": []}, {"id": 1900000000079, "en": "Play it safe", "senses": [{"pos": "modo di dire", "translations": ["agire cautamente", "non rischiare", "non strafare"]}], "categoryIds": []}, {"id": 1900000000080, "en": "A dog's dinner", "senses": [{"pos": "modo di dire", "translations": ["un pasticcio", "qualcosa di disordinato e fuori posto"]}], "categoryIds": []}, {"id": 1900000000081, "en": "Out of the blue", "senses": [{"pos": "modo di dire", "translations": ["all'improvviso", "di punto in bianco", "inaspettatamente"]}], "categoryIds": []}, {"id": 1900000000082, "en": "Crystal-clear", "senses": [{"pos": "aggettivo", "translations": ["chiarissimo", "cristallino"]}], "categoryIds": []}, {"id": 1900000000083, "en": "Nail it", "senses": [{"pos": "modo di dire", "translations": ["cogliere nel segno", "riuscire perfettamente"]}], "categoryIds": []}, {"id": 1900000000084, "en": "Take a rain check", "senses": [{"pos": "modo di dire", "translations": ["rimandare a un'altra volta", "non poter accettare un invito"]}], "categoryIds": []}, {"id": 1900000000085, "en": "The last straw", "senses": [{"pos": "modo di dire", "translations": ["l'ultima goccia che fa traboccare il vaso"]}], "categoryIds": []}, {"id": 1900000000086, "en": "I'm done", "senses": [{"pos": "modo di dire", "translations": ["ho finito", "ho chiuso"]}], "categoryIds": []}, {"id": 1900000000087, "en": "It's over", "senses": [{"pos": "modo di dire", "translations": ["è finita"]}], "categoryIds": []}, {"id": 1900000000088, "en": "Call it a day", "senses": [{"pos": "modo di dire", "translations": ["per oggi basta", "la mia giornata è finita"]}], "categoryIds": []}, {"id": 1900000000089, "en": "Make my day", "senses": [{"pos": "modo di dire", "translations": ["rendermi felice", "rallegrarmi la giornata"]}], "categoryIds": []}, {"id": 1900000000090, "en": "What about...?", "senses": [{"pos": "modo di dire", "translations": ["per quanto riguarda...?", "e se...?", "che ne dici...?"]}], "categoryIds": []}, {"id": 1900000000091, "en": "Make it", "senses": [{"pos": "modo di dire", "translations": ["farcela ad arrivare in tempo", "farcela ad avere successo", "sopravvivere"]}], "categoryIds": []}, {"id": 1900000000092, "en": "Catch up", "senses": [{"pos": "modo di dire", "translations": ["beccarsi con qualcuno", "rivedersi", "aggiornarsi"]}], "categoryIds": []}, {"id": 1900000000093, "en": "Catch up with", "senses": [{"pos": "modo di dire", "translations": ["recuperare una relazione con una persona", "mettersi in pari"]}], "categoryIds": []}, {"id": 1900000000094, "en": "Catch up on", "senses": [{"pos": "modo di dire", "translations": ["aggiornarsi su qualcosa", "recuperare notizie o lavoro arretrato"]}], "categoryIds": []}, {"id": 1900000000095, "en": "No way", "senses": [{"pos": "modo di dire", "translations": ["neanche per idea!", "nemmeno per sogno!", "figurati!", "impossibile!"]}], "categoryIds": []}, {"id": 1900000000096, "en": "See you later", "senses": [{"pos": "modo di dire", "translations": ["ci vediamo", "a dopo (si usa senza necessariamente vedersi dopo)"]}], "categoryIds": []}, {"id": 1900000000097, "en": "Go with the flow", "senses": [{"pos": "modo di dire", "translations": ["lasciarsi trasportare"]}], "categoryIds": []}, {"id": 1900000000098, "en": "Figure out", "senses": [{"pos": "modo di dire", "translations": ["capire", "comprendere", "risolvere"]}], "categoryIds": []}, {"id": 1900000000099, "en": "So far so good", "senses": [{"pos": "modo di dire", "translations": ["fin qui tutto bene"]}], "categoryIds": []}, {"id": 1900000000100, "en": "Sugarcoat", "senses": [{"pos": "modo di dire", "translations": ["addolcire la pillola", "abbellire la realtà"]}], "categoryIds": []}, {"id": 1900000000101, "en": "It's a good thing", "senses": [{"pos": "modo di dire", "translations": ["meno male", "per fortuna"]}], "categoryIds": []}, {"id": 1900000000102, "en": "Just as well", "senses": [{"pos": "modo di dire", "translations": ["meno male che", "per fortuna che"]}], "categoryIds": []}, {"id": 1900000000103, "en": "Thank God", "senses": [{"pos": "modo di dire", "translations": ["meno male", "grazie a Dio"]}], "categoryIds": []}, {"id": 1900000000104, "en": "Mi raccomando", "senses": [{"pos": "modo di dire", "translations": ["please", "per favore (dall'italiano)"]}], "categoryIds": []}, {"id": 1900000000105, "en": "I'm counting on you", "senses": [{"pos": "modo di dire", "translations": ["conto su di te"]}], "categoryIds": []}, {"id": 1900000000106, "en": "Make sure", "senses": [{"pos": "modo di dire", "translations": ["assicurarsi di", "fare in modo che"]}], "categoryIds": []}, {"id": 1900000000107, "en": "Still", "senses": [{"pos": "avverbio", "translations": ["ancora", "tuttora"]}], "categoryIds": []}, {"id": 1900000000108, "en": "Yet", "senses": [{"pos": "avverbio", "translations": ["ancora (frasi negative)", "già (frasi interrogative)"]}], "categoryIds": []}, {"id": 1900000000109, "en": "Already", "senses": [{"pos": "avverbio", "translations": ["già (frasi affermative)"]}], "categoryIds": []}, {"id": 1900000000110, "en": "Just", "senses": [{"pos": "avverbio", "translations": ["solo", "appena", "proprio"]}], "categoryIds": []}, {"id": 1900000000111, "en": "Even though", "senses": [{"pos": "avverbio", "translations": ["anche se", "nonostante", "sebbene"]}], "categoryIds": []}, {"id": 1900000000112, "en": "Although", "senses": [{"pos": "avverbio", "translations": ["sebbene", "anche se (formale)"]}], "categoryIds": []}, {"id": 1900000000113, "en": "Perhaps / Maybe", "senses": [{"pos": "avverbio", "translations": ["forse"]}], "categoryIds": []}, {"id": 1900000000114, "en": "Perhaps", "senses": [{"pos": "avverbio", "translations": ["forse (più formale di maybe)"]}], "categoryIds": []}, {"id": 1900000000115, "en": "Maybe", "senses": [{"pos": "avverbio", "translations": ["forse (meno formale di perhaps)"]}], "categoryIds": []}, {"id": 1900000000116, "en": "In spite of / Despite", "senses": [{"pos": "avverbio", "translations": ["nonostante", "malgrado"]}], "categoryIds": []}, {"id": 1900000000117, "en": "In spite of myself", "senses": [{"pos": "modo di dire", "translations": ["a mio malgrado"]}], "categoryIds": []}, {"id": 1900000000118, "en": "Quite", "senses": [{"pos": "avverbio", "translations": ["abbastanza"]}], "categoryIds": []}, {"id": 1900000000119, "en": "Rather", "senses": [{"pos": "avverbio", "translations": ["abbastanza", "piuttosto; preferire (would rather)"]}], "categoryIds": []}, {"id": 1900000000120, "en": "Rather than", "senses": [{"pos": "avverbio", "translations": ["piuttosto che"]}], "categoryIds": []}, {"id": 1900000000121, "en": "Further", "senses": [{"pos": "avverbio", "translations": ["più lontano", "ulteriormente", "inoltre"]}], "categoryIds": []}, {"id": 1900000000122, "en": "Furthermore", "senses": [{"pos": "avverbio", "translations": ["inoltre", "oltretutto", "per di più"]}], "categoryIds": []}, {"id": 1900000000123, "en": "Moreover", "senses": [{"pos": "avverbio", "translations": ["inoltre"]}], "categoryIds": []}, {"id": 1900000000124, "en": "As well", "senses": [{"pos": "avverbio", "translations": ["inoltre", "anche"]}], "categoryIds": []}, {"id": 1900000000125, "en": "In addition / Additionally", "senses": [{"pos": "avverbio", "translations": ["inoltre", "in aggiunta"]}], "categoryIds": []}, {"id": 1900000000126, "en": "Overall", "senses": [{"pos": "avverbio", "translations": ["complessivamente", "nel complesso; complessivo totale (agg.)"]}], "categoryIds": []}, {"id": 1900000000127, "en": "Generally", "senses": [{"pos": "avverbio", "translations": ["in generale", "generalmente", "per lo più", "di solito"]}], "categoryIds": []}, {"id": 1900000000128, "en": "Usually", "senses": [{"pos": "avverbio", "translations": ["di solito", "solitamente", "abitualmente"]}], "categoryIds": []}, {"id": 1900000000129, "en": "Elsewhere / Somewhere else", "senses": [{"pos": "avverbio", "translations": ["altrove"]}], "categoryIds": []}, {"id": 1900000000130, "en": "Instead", "senses": [{"pos": "avverbio", "translations": ["invece (si posiziona a inizio o fine frase)"]}], "categoryIds": []}, {"id": 1900000000131, "en": "At least", "senses": [{"pos": "avverbio", "translations": ["almeno", "come minimo"]}], "categoryIds": []}, {"id": 1900000000132, "en": "Almost", "senses": [{"pos": "avverbio", "translations": ["quasi"]}], "categoryIds": []}, {"id": 1900000000133, "en": "Nearly", "senses": [{"pos": "avverbio", "translations": ["quasi"]}], "categoryIds": []}, {"id": 1900000000134, "en": "However", "senses": [{"pos": "avverbio", "translations": ["comunque", "in ogni caso"]}], "categoryIds": []}, {"id": 1900000000135, "en": "Anyway", "senses": [{"pos": "avverbio", "translations": ["comunque"]}], "categoryIds": []}, {"id": 1900000000136, "en": "Otherwise", "senses": [{"pos": "avverbio", "translations": ["altrimenti", "diversamente", "in caso contrario"]}], "categoryIds": []}, {"id": 1900000000137, "en": "Even", "senses": [{"pos": "avverbio", "translations": ["ancora", "perfino", "anche"]}], "categoryIds": []}, {"id": 1900000000138, "en": "Actually", "senses": [{"pos": "avverbio", "translations": ["in realtà", "in verità", "effettivamente", "per davvero"]}], "categoryIds": []}, {"id": 1900000000139, "en": "Nowadays", "senses": [{"pos": "avverbio", "translations": ["oggigiorno", "al giorno d'oggi", "di questi tempi"]}], "categoryIds": []}, {"id": 1900000000140, "en": "Currently", "senses": [{"pos": "avverbio", "translations": ["attualmente"]}], "categoryIds": []}, {"id": 1900000000141, "en": "Since", "senses": [{"pos": "avverbio", "translations": ["da", "dal", "da allora (punto preciso nel tempo vs. for = durata)"]}], "categoryIds": []}, {"id": 1900000000142, "en": "While", "senses": [{"pos": "avverbio", "translations": ["mentre"]}], "categoryIds": []}, {"id": 1900000000143, "en": "Loosely", "senses": [{"pos": "avverbio", "translations": ["liberamente", "vagamente"]}], "categoryIds": []}, {"id": 1900000000144, "en": "Upward", "senses": [{"pos": "avverbio", "translations": ["verso l'alto", "in alto", "in su"]}], "categoryIds": []}, {"id": 1900000000145, "en": "Downward", "senses": [{"pos": "avverbio", "translations": ["verso il basso", "in basso", "in giù"]}], "categoryIds": []}, {"id": 1900000000146, "en": "Whose", "senses": [{"pos": "aggettivo", "translations": ["di chi (Whose keys are these?)"]}], "categoryIds": []}, {"id": 1900000000147, "en": "Be late", "senses": [{"pos": "modo di dire", "translations": ["essere in ritardo - l'evento è già iniziato"]}], "categoryIds": []}, {"id": 1900000000148, "en": "Run late", "senses": [{"pos": "modo di dire", "translations": ["essere in ritardo - l'evento non è ancora iniziato"]}], "categoryIds": []}, {"id": 1900000000149, "en": "Wednesday", "senses": [{"pos": "sostantivo", "translations": ["mercoledì"]}], "categoryIds": []}, {"id": 1900000000150, "en": "Thursday", "senses": [{"pos": "sostantivo", "translations": ["giovedì"]}], "categoryIds": []}, {"id": 1900000000151, "en": "Improve", "senses": [{"pos": "verbo", "translations": ["migliorare"]}], "categoryIds": []}, {"id": 1900000000152, "en": "Enhance", "senses": [{"pos": "verbo", "translations": ["incrementare", "aumentare", "migliorare", "accrescere"]}], "categoryIds": []}, {"id": 1900000000153, "en": "Increase", "senses": [{"pos": "verbo", "translations": ["aumentare", "incrementare"]}], "categoryIds": []}, {"id": 1900000000154, "en": "Grow", "senses": [{"pos": "verbo", "translations": ["crescere", "espandersi", "diventare grande"]}], "categoryIds": []}, {"id": 1900000000155, "en": "Grow up", "senses": [{"pos": "verbo", "translations": ["crescere", "diventare adulti", "maturare"]}], "categoryIds": []}, {"id": 1900000000156, "en": "Linger", "senses": [{"pos": "verbo", "translations": ["soffermarsi", "persistere"]}], "categoryIds": []}, {"id": 1900000000157, "en": "Avoid", "senses": [{"pos": "verbo", "translations": ["evitare"]}], "categoryIds": []}, {"id": 1900000000158, "en": "Allow", "senses": [{"pos": "verbo", "translations": ["permettere"]}], "categoryIds": []}, {"id": 1900000000159, "en": "Villain", "senses": [{"pos": "sostantivo", "translations": ["cattivo (personaggio)"]}], "categoryIds": []}, {"id": 1900000000160, "en": "Invoice", "senses": [{"pos": "sostantivo", "translations": ["fattura"]}], "categoryIds": []}, {"id": 1900000000161, "en": "Receipt", "senses": [{"pos": "sostantivo", "translations": ["scontrino"]}], "categoryIds": []}, {"id": 1900000000162, "en": "Bill (uk) / Check (usa)", "senses": [{"pos": "sostantivo", "translations": ["conto (ristorante)", "bolletta"]}], "categoryIds": []}, {"id": 1900000000163, "en": "Dealer", "senses": [{"pos": "sostantivo", "translations": ["commerciante", "fornitore", "rivenditore"]}], "categoryIds": []}, {"id": 1900000000164, "en": "(Drug) dealer", "senses": [{"pos": "sostantivo", "translations": ["spacciatore"]}], "categoryIds": []}, {"id": 1900000000165, "en": "Seller", "senses": [{"pos": "sostantivo", "translations": ["venditore"]}], "categoryIds": []}, {"id": 1900000000166, "en": "Customer", "senses": [{"pos": "sostantivo", "translations": ["cliente (da un negozio)"]}], "categoryIds": []}, {"id": 1900000000167, "en": "Client", "senses": [{"pos": "sostantivo", "translations": ["cliente (servizi professionali", "lungo termine)"]}], "categoryIds": []}, {"id": 1900000000168, "en": "Commodity", "senses": [{"pos": "sostantivo", "translations": ["bene commerciabile (materie prime", "borsa)"]}], "categoryIds": []}, {"id": 1900000000169, "en": "Merchandise", "senses": [{"pos": "sostantivo", "translations": ["merce in vendita o acquistata"]}], "categoryIds": []}, {"id": 1900000000170, "en": "Item", "senses": [{"pos": "sostantivo", "translations": ["articolo", "oggetto"]}], "categoryIds": []}, {"id": 1900000000171, "en": "Stuff", "senses": [{"pos": "sostantivo", "translations": ["cose", "roba"]}], "categoryIds": []}, {"id": 1900000000172, "en": "Warehouse", "senses": [{"pos": "sostantivo", "translations": ["magazzino"]}], "categoryIds": []}, {"id": 1900000000173, "en": "Buy", "senses": [{"pos": "verbo", "translations": ["comprare"]}], "categoryIds": []}, {"id": 1900000000174, "en": "Purchase", "senses": [{"pos": "verbo", "translations": ["comprare (formale", "contratti e grandi prodotti)"]}], "categoryIds": []}, {"id": 1900000000175, "en": "Sales", "senses": [{"pos": "sostantivo", "translations": ["vendite", "saldi"]}], "categoryIds": []}, {"id": 1900000000176, "en": "Gross", "senses": [{"pos": "aggettivo", "translations": ["lordo; grossolano"]}], "categoryIds": []}, {"id": 1900000000177, "en": "Gain", "senses": [{"pos": "verbo", "translations": ["guadagno", "guadagnare", "ottenere"]}], "categoryIds": []}, {"id": 1900000000178, "en": "Revenue", "senses": [{"pos": "sostantivo", "translations": ["entrata", "ricavo", "fatturato"]}], "categoryIds": []}, {"id": 1900000000179, "en": "Profit", "senses": [{"pos": "sostantivo", "translations": ["profitto"]}], "categoryIds": []}, {"id": 1900000000180, "en": "Income", "senses": [{"pos": "sostantivo", "translations": ["reddito"]}], "categoryIds": []}, {"id": 1900000000181, "en": "Salary", "senses": [{"pos": "sostantivo", "translations": ["stipendio"]}], "categoryIds": []}, {"id": 1900000000182, "en": "Pay", "senses": [{"pos": "sostantivo", "translations": ["paga", "pagare"]}], "categoryIds": []}, {"id": 1900000000183, "en": "Turnover", "senses": [{"pos": "sostantivo", "translations": ["fatturato"]}], "categoryIds": []}, {"id": 1900000000184, "en": "Bid", "senses": [{"pos": "sostantivo", "translations": ["offerta"]}], "categoryIds": []}, {"id": 1900000000185, "en": "Buck", "senses": [{"pos": "sostantivo", "translations": ["dollaro (usa slang)"]}], "categoryIds": []}, {"id": 1900000000186, "en": "Fire", "senses": [{"pos": "verbo", "translations": ["licenziare; sparare"]}], "categoryIds": []}, {"id": 1900000000187, "en": "Dismiss", "senses": [{"pos": "verbo", "translations": ["respingere", "licenziare", "ignorare"]}], "categoryIds": []}, {"id": 1900000000188, "en": "Resign", "senses": [{"pos": "verbo", "translations": ["dare le dimissioni", "licenziarsi; rassegnarsi"]}], "categoryIds": []}, {"id": 1900000000189, "en": "Hire", "senses": [{"pos": "verbo", "translations": ["assumere (dipendente)", "noleggio"]}], "categoryIds": []}, {"id": 1900000000190, "en": "Recruit", "senses": [{"pos": "verbo", "translations": ["assumere", "reclutare"]}], "categoryIds": []}, {"id": 1900000000191, "en": "Union (workers)", "senses": [{"pos": "sostantivo", "translations": ["sindacato"]}], "categoryIds": []}, {"id": 1900000000192, "en": "Strike", "senses": [{"pos": "sostantivo", "translations": ["sciopero; colpire; attacco"]}], "categoryIds": []}, {"id": 1900000000193, "en": "Shift", "senses": [{"pos": "sostantivo", "translations": ["turno (di lavoro)"]}], "categoryIds": []}, {"id": 1900000000194, "en": "Agreement", "senses": [{"pos": "sostantivo", "translations": ["accordo (più formale di deal)"]}], "categoryIds": []}, {"id": 1900000000195, "en": "Deal", "senses": [{"pos": "sostantivo", "translations": ["affare", "accordo"]}], "categoryIds": []}, {"id": 1900000000196, "en": "Deal with", "senses": [{"pos": "modo di dire", "translations": ["affrontare", "fare i conti con", "trattare"]}], "categoryIds": []}, {"id": 1900000000197, "en": "Amount", "senses": [{"pos": "sostantivo", "translations": ["quantità", "importo", "ammontare"]}], "categoryIds": []}, {"id": 1900000000198, "en": "Reject", "senses": [{"pos": "verbo", "translations": ["respingere", "rifiutare"]}], "categoryIds": []}, {"id": 1900000000199, "en": "Attend", "senses": [{"pos": "verbo", "translations": ["frequentare", "partecipare (scuola", "corso)"]}], "categoryIds": []}, {"id": 1900000000200, "en": "Hang out", "senses": [{"pos": "modo di dire", "translations": ["frequentare persone", "uscire; sporgere"]}], "categoryIds": []}, {"id": 1900000000201, "en": "Hangout", "senses": [{"pos": "sostantivo", "translations": ["ritrovo"]}], "categoryIds": []}, {"id": 1900000000202, "en": "Hang", "senses": [{"pos": "verbo", "translations": ["appendere", "pendere", "impiccare"]}], "categoryIds": []}, {"id": 1900000000203, "en": "Strange", "senses": [{"pos": "aggettivo", "translations": ["strano"]}], "categoryIds": []}, {"id": 1900000000204, "en": "Weird", "senses": [{"pos": "aggettivo", "translations": ["molto strano e insolito", "inquietante"]}], "categoryIds": []}, {"id": 1900000000205, "en": "Weirdo", "senses": [{"pos": "sostantivo", "translations": ["persona strana o con comportamento strano"]}], "categoryIds": []}, {"id": 1900000000206, "en": "Freak", "senses": [{"pos": "sostantivo", "translations": ["fenomeno da baraccone"]}], "categoryIds": []}, {"id": 1900000000207, "en": "Nerd", "senses": [{"pos": "sostantivo", "translations": ["nerd"]}], "categoryIds": []}, {"id": 1900000000208, "en": "Geek", "senses": [{"pos": "sostantivo", "translations": ["nerd più evoluto"]}], "categoryIds": []}, {"id": 1900000000209, "en": "Awkward", "senses": [{"pos": "aggettivo", "translations": ["imbarazzante (situazione in cui non sei direttamente coinvolto)"]}], "categoryIds": []}, {"id": 1900000000210, "en": "Embarrassing", "senses": [{"pos": "aggettivo", "translations": ["imbarazzante (evento con connessione diretta a te)"]}], "categoryIds": []}, {"id": 1900000000211, "en": "Behaviour", "senses": [{"pos": "sostantivo", "translations": ["comportamento"]}], "categoryIds": []}, {"id": 1900000000212, "en": "Nasty", "senses": [{"pos": "aggettivo", "translations": ["cattivo", "disgustoso"]}], "categoryIds": []}, {"id": 1900000000213, "en": "Awful", "senses": [{"pos": "aggettivo", "translations": ["terribile", "orribile"]}], "categoryIds": []}, {"id": 1900000000214, "en": "Wicked", "senses": [{"pos": "aggettivo", "translations": ["malvagio"]}], "categoryIds": []}, {"id": 1900000000215, "en": "Naughty / mischievous", "senses": [{"pos": "aggettivo", "translations": ["birichino", "malizioso"]}], "categoryIds": []}, {"id": 1900000000216, "en": "Greed", "senses": [{"pos": "sostantivo", "translations": ["avidità; golosità", "ghiottoneria"]}], "categoryIds": []}, {"id": 1900000000217, "en": "Loose", "senses": [{"pos": "aggettivo", "translations": ["sciolto", "libero", "allentato", "sfuso", "largo (vestiti)"]}], "categoryIds": []}, {"id": 1900000000218, "en": "Bulk", "senses": [{"pos": "aggettivo", "translations": ["sfuso", "non confezionato"]}], "categoryIds": []}, {"id": 1900000000219, "en": "Melt", "senses": [{"pos": "verbo", "translations": ["sciogliere", "liquefare"]}], "categoryIds": []}, {"id": 1900000000220, "en": "Molten", "senses": [{"pos": "aggettivo", "translations": ["liquefatto", "fuso (da calore)"]}], "categoryIds": []}, {"id": 1900000000221, "en": "Facility", "senses": [{"pos": "sostantivo", "translations": ["struttura"]}], "categoryIds": []}, {"id": 1900000000222, "en": "Brass", "senses": [{"pos": "sostantivo", "translations": ["ottone"]}], "categoryIds": []}, {"id": 1900000000223, "en": "Stainless", "senses": [{"pos": "aggettivo", "translations": ["inossidabile"]}], "categoryIds": []}, {"id": 1900000000224, "en": "Purpose / aim / goal", "senses": [{"pos": "sostantivo", "translations": ["scopo"]}], "categoryIds": []}, {"id": 1900000000225, "en": "Boundary", "senses": [{"pos": "sostantivo", "translations": ["confine", "limite"]}], "categoryIds": []}, {"id": 1900000000226, "en": "Slight", "senses": [{"pos": "aggettivo", "translations": ["leggero", "lieve", "piccolo"]}], "categoryIds": []}, {"id": 1900000000227, "en": "Subtle", "senses": [{"pos": "aggettivo", "translations": ["sottile", "impercettibile"]}], "categoryIds": []}, {"id": 1900000000228, "en": "Thin", "senses": [{"pos": "aggettivo", "translations": ["sottile (caratteristica fisica)"]}], "categoryIds": []}, {"id": 1900000000229, "en": "Weak", "senses": [{"pos": "aggettivo", "translations": ["debole (fisicamente)"]}], "categoryIds": []}, {"id": 1900000000230, "en": "Faint", "senses": [{"pos": "verbo", "translations": ["svenire; debole", "tenue", "vago", "indistinto"]}], "categoryIds": []}, {"id": 1900000000231, "en": "Tired", "senses": [{"pos": "aggettivo", "translations": ["stanco", "affaticato", "stufo"]}], "categoryIds": []}, {"id": 1900000000232, "en": "Weary", "senses": [{"pos": "aggettivo", "translations": ["sfinito", "esausto (sia mentalmente che fisicamente)"]}], "categoryIds": []}, {"id": 1900000000233, "en": "Exhausted", "senses": [{"pos": "aggettivo", "translations": ["esausto"]}], "categoryIds": []}, {"id": 1900000000234, "en": "Gnarly", "senses": [{"pos": "aggettivo", "translations": ["nodoso", "grinzoso; figo/sgradevole (US slang)"]}], "categoryIds": []}, {"id": 1900000000235, "en": "Crease", "senses": [{"pos": "sostantivo", "translations": ["piega", "grinza", "spiegazzarsi"]}], "categoryIds": []}, {"id": 1900000000236, "en": "Creased", "senses": [{"pos": "aggettivo", "translations": ["spiegazzato", "sgualcito"]}], "categoryIds": []}, {"id": 1900000000237, "en": "Fold", "senses": [{"pos": "verbo", "translations": ["piegare", "ripiegare; chiudere i battenti"]}], "categoryIds": []}, {"id": 1900000000238, "en": "Grab", "senses": [{"pos": "verbo", "translations": ["prendere", "afferrare"]}], "categoryIds": []}, {"id": 1900000000239, "en": "Snatch", "senses": [{"pos": "verbo", "translations": ["prendere", "afferrare in modo violento"]}], "categoryIds": []}, {"id": 1900000000240, "en": "Grasp", "senses": [{"pos": "verbo", "translations": ["cogliere", "comprendere", "afferrare (un concetto)"]}], "categoryIds": []}, {"id": 1900000000241, "en": "Steady", "senses": [{"pos": "aggettivo", "translations": ["costante", "fisso", "stabile"]}], "categoryIds": []}, {"id": 1900000000242, "en": "Release", "senses": [{"pos": "verbo", "translations": ["rilascio", "rilasciare", "liberare", "pubblicare", "lancio"]}], "categoryIds": []}, {"id": 1900000000243, "en": "Drop", "senses": [{"pos": "sostantivo", "translations": ["goccia", "calo", "abbassamento", "rilasciare"]}], "categoryIds": []}, {"id": 1900000000244, "en": "Decrease", "senses": [{"pos": "sostantivo", "translations": ["diminuzione", "calo", "decrescita"]}], "categoryIds": []}, {"id": 1900000000245, "en": "Follow", "senses": [{"pos": "verbo", "translations": ["seguire"]}], "categoryIds": []}, {"id": 1900000000246, "en": "Chase", "senses": [{"pos": "verbo", "translations": ["inseguire", "inseguimento", "caccia"]}], "categoryIds": []}, {"id": 1900000000247, "en": "Pursue", "senses": [{"pos": "verbo", "translations": ["inseguire", "perseguire", "ricercare"]}], "categoryIds": []}, {"id": 1900000000248, "en": "Pursuit", "senses": [{"pos": "sostantivo", "translations": ["inseguimento"]}], "categoryIds": []}, {"id": 1900000000249, "en": "Stalk", "senses": [{"pos": "verbo", "translations": ["perseguitare", "inseguire; stelo"]}], "categoryIds": []}, {"id": 1900000000250, "en": "Run after (somebody)", "senses": [{"pos": "modo di dire", "translations": ["correre dietro a qualcuno"]}], "categoryIds": []}, {"id": 1900000000251, "en": "Hunt", "senses": [{"pos": "verbo", "translations": ["cacciare"]}], "categoryIds": []}, {"id": 1900000000252, "en": "Catch / Capture", "senses": [{"pos": "verbo", "translations": ["catturare"]}], "categoryIds": []}, {"id": 1900000000253, "en": "Track", "senses": [{"pos": "verbo", "translations": ["tracciare", "pista", "tracciato", "monitorare"]}], "categoryIds": []}, {"id": 1900000000254, "en": "Trail", "senses": [{"pos": "sostantivo", "translations": ["sentiero", "percorso"]}], "categoryIds": []}, {"id": 1900000000255, "en": "Path", "senses": [{"pos": "sostantivo", "translations": ["percorso", "sentiero", "cammino"]}], "categoryIds": []}, {"id": 1900000000256, "en": "Route", "senses": [{"pos": "sostantivo", "translations": ["percorso", "itinerario"]}], "categoryIds": []}, {"id": 1900000000257, "en": "Hike", "senses": [{"pos": "sostantivo", "translations": ["escursione"]}], "categoryIds": []}, {"id": 1900000000258, "en": "Watch out / careful", "senses": [{"pos": "modo di dire", "translations": ["attenzione", "stare attento"]}], "categoryIds": []}, {"id": 1900000000259, "en": "Can't wait", "senses": [{"pos": "modo di dire", "translations": ["non vedere l'ora di (più enfasi e informale)"]}], "categoryIds": []}, {"id": 1900000000260, "en": "Look forward to", "senses": [{"pos": "modo di dire", "translations": ["non vedere l'ora di"]}], "categoryIds": []}, {"id": 1900000000261, "en": "I look forward to hearing from you", "senses": [{"pos": "modo di dire", "translations": ["resto in attesa di sue notizie"]}], "categoryIds": []}, {"id": 1900000000262, "en": "Look out", "senses": [{"pos": "modo di dire", "translations": ["guardare fuori", "attenzione"]}], "categoryIds": []}, {"id": 1900000000263, "en": "Look after", "senses": [{"pos": "modo di dire", "translations": ["badare", "occuparsi"]}], "categoryIds": []}, {"id": 1900000000264, "en": "Look up", "senses": [{"pos": "modo di dire", "translations": ["ricercare informazioni scritte", "guardare su"]}], "categoryIds": []}, {"id": 1900000000265, "en": "Look for", "senses": [{"pos": "modo di dire", "translations": ["cercare"]}], "categoryIds": []}, {"id": 1900000000266, "en": "Seek", "senses": [{"pos": "verbo", "translations": ["cercare (formale e old-fashioned)"]}], "categoryIds": []}, {"id": 1900000000267, "en": "Search", "senses": [{"pos": "sostantivo", "translations": ["ricerca come funzione"]}], "categoryIds": []}, {"id": 1900000000268, "en": "Search engine", "senses": [{"pos": "sostantivo", "translations": ["motore di ricerca"]}], "categoryIds": []}, {"id": 1900000000269, "en": "Topic", "senses": [{"pos": "sostantivo", "translations": ["argomento", "discussione"]}], "categoryIds": []}, {"id": 1900000000270, "en": "Argument", "senses": [{"pos": "sostantivo", "translations": ["argomento", "discussione; litigio"]}], "categoryIds": []}, {"id": 1900000000271, "en": "Discussion", "senses": [{"pos": "sostantivo", "translations": ["discussione"]}], "categoryIds": []}, {"id": 1900000000272, "en": "Awareness", "senses": [{"pos": "sostantivo", "translations": ["consapevolezza"]}], "categoryIds": []}, {"id": 1900000000273, "en": "Consciousness", "senses": [{"pos": "sostantivo", "translations": ["coscienza"]}], "categoryIds": []}, {"id": 1900000000274, "en": "Fog", "senses": [{"pos": "sostantivo", "translations": ["nebbia"]}], "categoryIds": []}, {"id": 1900000000275, "en": "Mist", "senses": [{"pos": "sostantivo", "translations": ["nebbia (meno densa)"]}], "categoryIds": []}, {"id": 1900000000276, "en": "Haze", "senses": [{"pos": "sostantivo", "translations": ["foschia"]}], "categoryIds": []}, {"id": 1900000000277, "en": "Unripe", "senses": [{"pos": "aggettivo", "translations": ["non maturo"]}], "categoryIds": []}, {"id": 1900000000278, "en": "Ripe", "senses": [{"pos": "aggettivo", "translations": ["maturo (fruit)"]}], "categoryIds": []}, {"id": 1900000000279, "en": "Overripe", "senses": [{"pos": "aggettivo", "translations": ["troppo maturo"]}], "categoryIds": []}, {"id": 1900000000280, "en": "Rotten", "senses": [{"pos": "aggettivo", "translations": ["marcio"]}], "categoryIds": []}, {"id": 1900000000281, "en": "Mature", "senses": [{"pos": "aggettivo", "translations": ["maturo (for humans and animals)"]}], "categoryIds": []}, {"id": 1900000000282, "en": "Immature", "senses": [{"pos": "aggettivo", "translations": ["immaturo"]}], "categoryIds": []}, {"id": 1900000000283, "en": "Chopstick", "senses": [{"pos": "sostantivo", "translations": ["bacchette"]}], "categoryIds": []}, {"id": 1900000000284, "en": "Stick", "senses": [{"pos": "sostantivo", "translations": ["bastone"]}], "categoryIds": []}, {"id": 1900000000285, "en": "Chop", "senses": [{"pos": "verbo", "translations": ["tritare (pezzi larghi non uniformi)"]}], "categoryIds": []}, {"id": 1900000000286, "en": "Dice", "senses": [{"pos": "verbo", "translations": ["tritare (pezzi piccoli e uniformi)"]}], "categoryIds": []}, {"id": 1900000000287, "en": "Mince", "senses": [{"pos": "verbo", "translations": ["tritare molto finemente"]}], "categoryIds": []}, {"id": 1900000000288, "en": "Mince meat", "senses": [{"pos": "sostantivo", "translations": ["carne macinata"]}], "categoryIds": []}, {"id": 1900000000289, "en": "Grind", "senses": [{"pos": "verbo", "translations": ["macinare"]}], "categoryIds": []}, {"id": 1900000000290, "en": "Tasty", "senses": [{"pos": "aggettivo", "translations": ["gustoso"]}], "categoryIds": []}, {"id": 1900000000291, "en": "Porch", "senses": [{"pos": "sostantivo", "translations": ["portico", "veranda"]}], "categoryIds": []}, {"id": 1900000000292, "en": "Hand me", "senses": [{"pos": "modo di dire", "translations": ["passare (can you hand me your phone?)"]}], "categoryIds": []}, {"id": 1900000000293, "en": "Give (gave given)", "senses": [{"pos": "verbo", "translations": ["dare"]}], "categoryIds": []}, {"id": 1900000000294, "en": "Take (took taken)", "senses": [{"pos": "verbo", "translations": ["prendere/portare (da un luogo)"]}], "categoryIds": []}, {"id": 1900000000295, "en": "Bring (brought brought)", "senses": [{"pos": "verbo", "translations": ["portare (nel luogo in cui si è presenti)"]}], "categoryIds": []}, {"id": 1900000000296, "en": "Carry", "senses": [{"pos": "verbo", "translations": ["portare (enfasi sull'atto del trasporto)"]}], "categoryIds": []}, {"id": 1900000000297, "en": "Manners", "senses": [{"pos": "sostantivo", "translations": ["buone maniere"]}], "categoryIds": []}, {"id": 1900000000298, "en": "Summit", "senses": [{"pos": "sostantivo", "translations": ["vetta"]}], "categoryIds": []}, {"id": 1900000000299, "en": "Peak", "senses": [{"pos": "sostantivo", "translations": ["picco", "punta", "vetta"]}], "categoryIds": []}, {"id": 1900000000300, "en": "Rope", "senses": [{"pos": "sostantivo", "translations": ["fune"]}], "categoryIds": []}, {"id": 1900000000301, "en": "Wire", "senses": [{"pos": "sostantivo", "translations": ["filo (metallico o da elettricista)"]}], "categoryIds": []}, {"id": 1900000000302, "en": "Thread", "senses": [{"pos": "sostantivo", "translations": ["filo (da cucito)"]}], "categoryIds": []}, {"id": 1900000000303, "en": "Cable", "senses": [{"pos": "sostantivo", "translations": ["cavo"]}], "categoryIds": []}, {"id": 1900000000304, "en": "Rise (rose risen)", "senses": [{"pos": "verbo", "translations": ["aumento (di stipendio)", "sorgere (sole)", "salire"]}], "categoryIds": []}, {"id": 1900000000305, "en": "Raise", "senses": [{"pos": "verbo", "translations": ["aumentare", "alzare (transitivo)"]}], "categoryIds": []}, {"id": 1900000000306, "en": "Arise (arose arisen)", "senses": [{"pos": "verbo", "translations": ["aumentare (associato a nomi astratti)"]}], "categoryIds": []}, {"id": 1900000000307, "en": "Descent", "senses": [{"pos": "sostantivo", "translations": ["discesa"]}], "categoryIds": []}, {"id": 1900000000308, "en": "Climb", "senses": [{"pos": "verbo", "translations": ["salire", "scalare", "arrampicarsi su"]}], "categoryIds": []}, {"id": 1900000000309, "en": "Uphill", "senses": [{"pos": "aggettivo", "translations": ["in salita"]}], "categoryIds": []}, {"id": 1900000000310, "en": "Downhill", "senses": [{"pos": "aggettivo", "translations": ["in discesa", "discendente"]}], "categoryIds": []}, {"id": 1900000000311, "en": "Ascent", "senses": [{"pos": "sostantivo", "translations": ["salita", "ascesa", "risalita"]}], "categoryIds": []}, {"id": 1900000000312, "en": "Hop on", "senses": [{"pos": "modo di dire", "translations": ["salire su", "salta su"]}], "categoryIds": []}, {"id": 1900000000313, "en": "Get on", "senses": [{"pos": "modo di dire", "translations": ["salire sul (bici", "moto", "bus", "treno", "nave)"]}], "categoryIds": []}, {"id": 1900000000314, "en": "Get in / into", "senses": [{"pos": "modo di dire", "translations": ["entrare in", "salire (auto", "furgoni", "camion)"]}], "categoryIds": []}, {"id": 1900000000315, "en": "Get out of", "senses": [{"pos": "modo di dire", "translations": ["uscire da"]}], "categoryIds": []}, {"id": 1900000000316, "en": "Get off", "senses": [{"pos": "modo di dire", "translations": ["scendere da; cavarsela"]}], "categoryIds": []}, {"id": 1900000000317, "en": "Get off with (slang)", "senses": [{"pos": "modo di dire", "translations": ["pomiciare con", "farsela con"]}], "categoryIds": []}, {"id": 1900000000318, "en": "Get up", "senses": [{"pos": "modo di dire", "translations": ["alzarsi", "salire"]}], "categoryIds": []}, {"id": 1900000000319, "en": "Get down", "senses": [{"pos": "modo di dire", "translations": ["scendere", "a terra"]}], "categoryIds": []}, {"id": 1900000000320, "en": "Go up", "senses": [{"pos": "modo di dire", "translations": ["salire"]}], "categoryIds": []}, {"id": 1900000000321, "en": "Leave (left left)", "senses": [{"pos": "verbo", "translations": ["partire", "lasciare", "andarsene; rimanere (left over)"]}], "categoryIds": []}, {"id": 1900000000322, "en": "Left over", "senses": [{"pos": "modo di dire", "translations": ["rimasto", "rimanenza"]}], "categoryIds": []}, {"id": 1900000000323, "en": "Leftover", "senses": [{"pos": "sostantivo", "translations": ["avanzo"]}], "categoryIds": []}, {"id": 1900000000324, "en": "Come down", "senses": [{"pos": "modo di dire", "translations": ["scendere", "vieni giù"]}], "categoryIds": []}, {"id": 1900000000325, "en": "Come up", "senses": [{"pos": "modo di dire", "translations": ["arrivare", "salire"]}], "categoryIds": []}, {"id": 1900000000326, "en": "Put up with", "senses": [{"pos": "modo di dire", "translations": ["sopportare", "tollerare"]}], "categoryIds": []}, {"id": 1900000000327, "en": "Do up", "senses": [{"pos": "modo di dire", "translations": ["rinnovare", "ristrutturare; allacciare con bottoni o zip"]}], "categoryIds": []}, {"id": 1900000000328, "en": "Tie up", "senses": [{"pos": "modo di dire", "translations": ["allacciare con corde", "lacci", "stringhe"]}], "categoryIds": []}, {"id": 1900000000329, "en": "Show up / turn up", "senses": [{"pos": "modo di dire", "translations": ["arrivare", "comparire", "apparire", "essere visibile"]}], "categoryIds": []}, {"id": 1900000000330, "en": "Turn up", "senses": [{"pos": "modo di dire", "translations": ["saltare fuori; alzare volume"]}], "categoryIds": []}, {"id": 1900000000331, "en": "Break down", "senses": [{"pos": "modo di dire", "translations": ["guastarsi; buttare giù; disintegrare; scomporre"]}], "categoryIds": []}, {"id": 1900000000332, "en": "Breakdown", "senses": [{"pos": "sostantivo", "translations": ["guasto; interruzione della comunicazione; scomposizione analisi"]}], "categoryIds": []}, {"id": 1900000000333, "en": "Tidy up", "senses": [{"pos": "modo di dire", "translations": ["riordinare", "rassettare"]}], "categoryIds": []}, {"id": 1900000000334, "en": "Clear up", "senses": [{"pos": "modo di dire", "translations": ["riordinare; chiarire; schiarirsi (cielo)"]}], "categoryIds": []}, {"id": 1900000000335, "en": "Close down", "senses": [{"pos": "modo di dire", "translations": ["chiudere l'attività"]}], "categoryIds": []}, {"id": 1900000000336, "en": "Shut down", "senses": [{"pos": "modo di dire", "translations": ["chiudere l'attività; spegnere computer"]}], "categoryIds": []}, {"id": 1900000000337, "en": "Drop out", "senses": [{"pos": "modo di dire", "translations": ["ritirarsi (da una gara o corso di studi)"]}], "categoryIds": []}, {"id": 1900000000338, "en": "Dropout (slang)", "senses": [{"pos": "sostantivo", "translations": ["studente rinunciatario", "ritirato dagli studi"]}], "categoryIds": []}, {"id": 1900000000339, "en": "Move in", "senses": [{"pos": "modo di dire", "translations": ["trasferirsi; intervenire", "subentrarsi"]}], "categoryIds": []}, {"id": 1900000000340, "en": "Show off", "senses": [{"pos": "modo di dire", "translations": ["vantarsi", "darsi arie"]}], "categoryIds": []}, {"id": 1900000000341, "en": "Show ... around", "senses": [{"pos": "modo di dire", "translations": ["far fare un giro a qualcuno"]}], "categoryIds": []}, {"id": 1900000000342, "en": "Give up", "senses": [{"pos": "modo di dire", "translations": ["arrendersi", "rinunciare a", "smettere di"]}], "categoryIds": []}, {"id": 1900000000343, "en": "(Bed) Sheet", "senses": [{"pos": "sostantivo", "translations": ["lenzuolo"]}], "categoryIds": []}, {"id": 1900000000344, "en": "Blanket", "senses": [{"pos": "sostantivo", "translations": ["coperta"]}], "categoryIds": []}, {"id": 1900000000345, "en": "Duvet / Comforter / Quilt", "senses": [{"pos": "sostantivo", "translations": ["piumone"]}], "categoryIds": []}, {"id": 1900000000346, "en": "Pillow", "senses": [{"pos": "sostantivo", "translations": ["cuscino (per dormire)"]}], "categoryIds": []}, {"id": 1900000000347, "en": "Cushion", "senses": [{"pos": "sostantivo", "translations": ["cuscino (generico)"]}], "categoryIds": []}, {"id": 1900000000348, "en": "Mattress", "senses": [{"pos": "sostantivo", "translations": ["materasso"]}], "categoryIds": []}, {"id": 1900000000349, "en": "Bedside table / nightstand", "senses": [{"pos": "sostantivo", "translations": ["comodino"]}], "categoryIds": []}, {"id": 1900000000350, "en": "Drawer", "senses": [{"pos": "sostantivo", "translations": ["cassetto"]}], "categoryIds": []}, {"id": 1900000000351, "en": "Furniture", "senses": [{"pos": "sostantivo", "translations": ["mobile/i (uncountable)"]}], "categoryIds": []}, {"id": 1900000000352, "en": "Wardrobe (uk)", "senses": [{"pos": "sostantivo", "translations": ["armadio"]}], "categoryIds": []}, {"id": 1900000000353, "en": "Walk-in wardrobe / closet", "senses": [{"pos": "sostantivo", "translations": ["cabina armadio"]}], "categoryIds": []}, {"id": 1900000000354, "en": "Cupboard", "senses": [{"pos": "sostantivo", "translations": ["credenza cucina"]}], "categoryIds": []}, {"id": 1900000000355, "en": "Tablecloth", "senses": [{"pos": "sostantivo", "translations": ["tovaglia"]}], "categoryIds": []}, {"id": 1900000000356, "en": "Injury", "senses": [{"pos": "sostantivo", "translations": ["infortunio", "ferita", "torto"]}], "categoryIds": []}, {"id": 1900000000357, "en": "Wound", "senses": [{"pos": "sostantivo", "translations": ["ferita (esterna); ferire"]}], "categoryIds": []}, {"id": 1900000000358, "en": "Hurt", "senses": [{"pos": "verbo", "translations": ["fare male; ferire", "farsi male; ferito (adj)"]}], "categoryIds": []}, {"id": 1900000000359, "en": "Pain", "senses": [{"pos": "sostantivo", "translations": ["sofferenza", "dolore"]}], "categoryIds": []}, {"id": 1900000000360, "en": "Fault", "senses": [{"pos": "sostantivo", "translations": ["colpa (it's my fault)"]}], "categoryIds": []}, {"id": 1900000000361, "en": "Blame", "senses": [{"pos": "verbo", "translations": ["incolpare"]}], "categoryIds": []}, {"id": 1900000000362, "en": "Guilt", "senses": [{"pos": "sostantivo", "translations": ["colpevole", "in colpa"]}], "categoryIds": []}, {"id": 1900000000363, "en": "Bother", "senses": [{"pos": "verbo", "translations": ["disturbare"]}], "categoryIds": []}, {"id": 1900000000364, "en": "Regret", "senses": [{"pos": "sostantivo", "translations": ["rammmarico", "rimpianto", "dispiacere"]}], "categoryIds": []}, {"id": 1900000000365, "en": "Pole", "senses": [{"pos": "sostantivo", "translations": ["palo"]}], "categoryIds": []}, {"id": 1900000000366, "en": "Tear (tore torn)", "senses": [{"pos": "sostantivo", "translations": ["lacrima", "strappare", "strappo"]}], "categoryIds": []}, {"id": 1900000000367, "en": "Rip", "senses": [{"pos": "verbo", "translations": ["strappare"]}], "categoryIds": []}, {"id": 1900000000368, "en": "Caption", "senses": [{"pos": "sostantivo", "translations": ["didascalia", "description"]}], "categoryIds": []}, {"id": 1900000000369, "en": "Kind", "senses": [{"pos": "aggettivo", "translations": ["gentile"]}], "categoryIds": []}, {"id": 1900000000370, "en": "Polite", "senses": [{"pos": "aggettivo", "translations": ["educato"]}], "categoryIds": []}, {"id": 1900000000371, "en": "He's fun / he's a vibe!", "senses": [{"pos": "modo di dire", "translations": ["simpatico", "mi piace!"]}], "categoryIds": []}, {"id": 1900000000372, "en": "Obnoxious / hateful", "senses": [{"pos": "aggettivo", "translations": ["odioso", "detestabile"]}], "categoryIds": []}, {"id": 1900000000373, "en": "Unpleasant", "senses": [{"pos": "aggettivo", "translations": ["sgradevole", "antipatico", "spiacevole"]}], "categoryIds": []}, {"id": 1900000000374, "en": "Unfriendly", "senses": [{"pos": "aggettivo", "translations": ["scortese", "ostile"]}], "categoryIds": []}, {"id": 1900000000375, "en": "Rude", "senses": [{"pos": "aggettivo", "translations": ["maleducato"]}], "categoryIds": []}, {"id": 1900000000376, "en": "Reliable", "senses": [{"pos": "aggettivo", "translations": ["affidabile"]}], "categoryIds": []}, {"id": 1900000000377, "en": "Bothersome", "senses": [{"pos": "aggettivo", "translations": ["fastidioso"]}], "categoryIds": []}, {"id": 1900000000378, "en": "Troublesome", "senses": [{"pos": "aggettivo", "translations": ["problematico", "fastidioso"]}], "categoryIds": []}, {"id": 1900000000379, "en": "Fussy", "senses": [{"pos": "aggettivo", "translations": ["pignolo"]}], "categoryIds": []}, {"id": 1900000000380, "en": "Picky", "senses": [{"pos": "aggettivo", "translations": ["esigente", "schizzinoso", "pignolo"]}], "categoryIds": []}, {"id": 1900000000381, "en": "Demanding", "senses": [{"pos": "aggettivo", "translations": ["esigente (persona difficile da accontentare; compito difficile)"]}], "categoryIds": []}, {"id": 1900000000382, "en": "Squeamish", "senses": [{"pos": "aggettivo", "translations": ["schizzinoso"]}], "categoryIds": []}, {"id": 1900000000383, "en": "Confident", "senses": [{"pos": "aggettivo", "translations": ["fiducioso"]}], "categoryIds": []}, {"id": 1900000000384, "en": "Tricky", "senses": [{"pos": "aggettivo", "translations": ["difficile", "complicato"]}], "categoryIds": []}, {"id": 1900000000385, "en": "Challenging", "senses": [{"pos": "aggettivo", "translations": ["impegnativo", "stimolante"]}], "categoryIds": []}, {"id": 1900000000386, "en": "Plenty", "senses": [{"pos": "aggettivo", "translations": ["molto", "abbondanza", "abbastanza"]}], "categoryIds": []}, {"id": 1900000000387, "en": "Several", "senses": [{"pos": "aggettivo", "translations": ["vari", "diversi", "più"]}], "categoryIds": []}, {"id": 1900000000388, "en": "Various", "senses": [{"pos": "aggettivo", "translations": ["vario", "diversi"]}], "categoryIds": []}, {"id": 1900000000389, "en": "Different", "senses": [{"pos": "aggettivo", "translations": ["diverso", "differente"]}], "categoryIds": []}, {"id": 1900000000390, "en": "Proper", "senses": [{"pos": "aggettivo", "translations": ["corretto", "adeguato", "giusto"]}], "categoryIds": []}, {"id": 1900000000391, "en": "Improper", "senses": [{"pos": "aggettivo", "translations": ["non adatto", "inadeguato", "inappropriato"]}], "categoryIds": []}, {"id": 1900000000392, "en": "Nap", "senses": [{"pos": "sostantivo", "translations": ["pisolino"]}], "categoryIds": []}, {"id": 1900000000393, "en": "Someone / somebody", "senses": [{"pos": "pronome", "translations": ["qualcuno (in chiave positiva)"]}], "categoryIds": []}, {"id": 1900000000394, "en": "Anyone / anybody", "senses": [{"pos": "pronome", "translations": ["qualcuno (in chiave negativa e domande)"]}], "categoryIds": []}, {"id": 1900000000395, "en": "Declaration", "senses": [{"pos": "sostantivo", "translations": ["dichiarazione"]}], "categoryIds": []}, {"id": 1900000000396, "en": "Statement", "senses": [{"pos": "sostantivo", "translations": ["dichiarazione", "opinione o posizione"]}], "categoryIds": []}, {"id": 1900000000397, "en": "Recommend", "senses": [{"pos": "verbo", "translations": ["raccomandare", "consigliare"]}], "categoryIds": []}, {"id": 1900000000398, "en": "Advise", "senses": [{"pos": "verbo", "translations": ["consiglio", "consulenza", "consigliare"]}], "categoryIds": []}, {"id": 1900000000399, "en": "Consulting", "senses": [{"pos": "sostantivo", "translations": ["consulenza"]}], "categoryIds": []}, {"id": 1900000000400, "en": "Tip", "senses": [{"pos": "sostantivo", "translations": ["punta", "mancia", "consiglio"]}], "categoryIds": []}, {"id": 1900000000401, "en": "Remark / Feedback / Comment", "senses": [{"pos": "sostantivo", "translations": ["osservazione", "commento", "nota"]}], "categoryIds": []}, {"id": 1900000000402, "en": "Review", "senses": [{"pos": "sostantivo", "translations": ["recensione", "revisione"]}], "categoryIds": []}, {"id": 1900000000403, "en": "Belief", "senses": [{"pos": "sostantivo", "translations": ["credenza", "fede", "opinione"]}], "categoryIds": []}, {"id": 1900000000404, "en": "Principal", "senses": [{"pos": "sostantivo", "translations": ["preside"]}], "categoryIds": []}, {"id": 1900000000405, "en": "Dean", "senses": [{"pos": "sostantivo", "translations": ["decano (direttore scolastico in USA sotto il preside)"]}], "categoryIds": []}, {"id": 1900000000406, "en": "Bodyshop", "senses": [{"pos": "sostantivo", "translations": ["carrozzeria (negozio)"]}], "categoryIds": []}, {"id": 1900000000407, "en": "Ceiling", "senses": [{"pos": "sostantivo", "translations": ["soffitto"]}], "categoryIds": []}, {"id": 1900000000408, "en": "Knock down", "senses": [{"pos": "modo di dire", "translations": ["abbattere", "demolire", "buttare giù"]}], "categoryIds": []}, {"id": 1900000000409, "en": "Shoot down", "senses": [{"pos": "modo di dire", "translations": ["abbattere", "colpire con arma da fuoco"]}], "categoryIds": []}, {"id": 1900000000410, "en": "Explode", "senses": [{"pos": "verbo", "translations": ["esplodere"]}], "categoryIds": []}, {"id": 1900000000411, "en": "Blow up", "senses": [{"pos": "modo di dire", "translations": ["esplodere", "saltare in aria"]}], "categoryIds": []}, {"id": 1900000000412, "en": "Blow", "senses": [{"pos": "verbo", "translations": ["soffiare; esplodere", "scoppiare"]}], "categoryIds": []}, {"id": 1900000000413, "en": "Switch off", "senses": [{"pos": "modo di dire", "translations": ["spegnere"]}], "categoryIds": []}, {"id": 1900000000414, "en": "Turn off", "senses": [{"pos": "modo di dire", "translations": ["spegnere"]}], "categoryIds": []}, {"id": 1900000000415, "en": "Light", "senses": [{"pos": "sostantivo", "translations": ["luce; leggero; lampada; illuminare; accendere"]}], "categoryIds": []}, {"id": 1900000000416, "en": "Switch on", "senses": [{"pos": "modo di dire", "translations": ["accendere", "azionare un dispositivo"]}], "categoryIds": []}, {"id": 1900000000417, "en": "Turn on", "senses": [{"pos": "modo di dire", "translations": ["accendere", "azionare; mettere contro; eccitare"]}], "categoryIds": []}, {"id": 1900000000418, "en": "Update", "senses": [{"pos": "verbo", "translations": ["aggiornare"]}], "categoryIds": []}, {"id": 1900000000419, "en": "Upgrade", "senses": [{"pos": "verbo", "translations": ["aggiornare", "alzare di livello"]}], "categoryIds": []}, {"id": 1900000000420, "en": "Refresh", "senses": [{"pos": "verbo", "translations": ["aggiornare", "rinfrescare"]}], "categoryIds": []}, {"id": 1900000000421, "en": "Charge", "senses": [{"pos": "verbo", "translations": ["caricare", "carica (batteria)"]}], "categoryIds": []}, {"id": 1900000000422, "en": "Recharge", "senses": [{"pos": "verbo", "translations": ["ricaricare", "ricarica"]}], "categoryIds": []}, {"id": 1900000000423, "en": "Reload", "senses": [{"pos": "verbo", "translations": ["ricaricare"]}], "categoryIds": []}, {"id": 1900000000424, "en": "Threat / Menace", "senses": [{"pos": "sostantivo", "translations": ["minaccia"]}], "categoryIds": []}, {"id": 1900000000425, "en": "There are (four) of us", "senses": [{"pos": "modo di dire", "translations": ["siamo in (quattro)"]}], "categoryIds": []}, {"id": 1900000000426, "en": "Within", "senses": [{"pos": "preposizione", "translations": ["entro (within 2 years)"]}], "categoryIds": []}, {"id": 1900000000427, "en": "Shaded", "senses": [{"pos": "aggettivo", "translations": ["ombreggiato", "sfumato"]}], "categoryIds": []}, {"id": 1900000000428, "en": "Shady", "senses": [{"pos": "aggettivo", "translations": ["persona losca o equivoca (usa)", "ombreggiato"]}], "categoryIds": []}, {"id": 1900000000429, "en": "Involve", "senses": [{"pos": "verbo", "translations": ["comportare", "implicare; coinvolgere"]}], "categoryIds": []}, {"id": 1900000000430, "en": "Anger", "senses": [{"pos": "sostantivo", "translations": ["rabbia"]}], "categoryIds": []}, {"id": 1900000000431, "en": "Rage", "senses": [{"pos": "sostantivo", "translations": ["rabbia (più intensa)"]}], "categoryIds": []}, {"id": 1900000000432, "en": "Mild", "senses": [{"pos": "aggettivo", "translations": ["mite", "lieve", "delicato"]}], "categoryIds": []}, {"id": 1900000000433, "en": "Mean", "senses": [{"pos": "verbo", "translations": ["dire", "significare", "intendere; meschino"]}], "categoryIds": []}, {"id": 1900000000434, "en": "Understand (understood)", "senses": [{"pos": "verbo", "translations": ["capire"]}], "categoryIds": []}, {"id": 1900000000435, "en": "Find out", "senses": [{"pos": "modo di dire", "translations": ["scoprire informazioni", "venire a sapere"]}], "categoryIds": []}, {"id": 1900000000436, "en": "Discover", "senses": [{"pos": "verbo", "translations": ["scoprire"]}], "categoryIds": []}, {"id": 1900000000437, "en": "Accommodate", "senses": [{"pos": "verbo", "translations": ["ospitare", "accogliere"]}], "categoryIds": []}, {"id": 1900000000438, "en": "Host", "senses": [{"pos": "verbo", "translations": ["ospitare; colui che ospita"]}], "categoryIds": []}, {"id": 1900000000439, "en": "Guest", "senses": [{"pos": "sostantivo", "translations": ["ospite", "invitato"]}], "categoryIds": []}, {"id": 1900000000440, "en": "Invite", "senses": [{"pos": "sostantivo", "translations": ["invito"]}], "categoryIds": []}, {"id": 1900000000441, "en": "Parent", "senses": [{"pos": "sostantivo", "translations": ["genitore"]}], "categoryIds": []}, {"id": 1900000000442, "en": "Relative", "senses": [{"pos": "sostantivo", "translations": ["parenti"]}], "categoryIds": []}, {"id": 1900000000443, "en": "Tough", "senses": [{"pos": "aggettivo", "translations": ["tosto", "duro", "resistente", "difficile"]}], "categoryIds": []}, {"id": 1900000000444, "en": "Probe", "senses": [{"pos": "sostantivo", "translations": ["sonda"]}], "categoryIds": []}, {"id": 1900000000445, "en": "Pillar", "senses": [{"pos": "sostantivo", "translations": ["pilastro", "colonna"]}], "categoryIds": []}, {"id": 1900000000446, "en": "Skeptical / sceptical", "senses": [{"pos": "aggettivo", "translations": ["scettico"]}], "categoryIds": []}, {"id": 1900000000447, "en": "Bound", "senses": [{"pos": "aggettivo", "translations": ["legato"]}], "categoryIds": []}, {"id": 1900000000448, "en": "Accomplished", "senses": [{"pos": "aggettivo", "translations": ["compiuto", "realizzato", "esperto"]}], "categoryIds": []}, {"id": 1900000000449, "en": "Placeholder", "senses": [{"pos": "sostantivo", "translations": ["segnaposto"]}], "categoryIds": []}, {"id": 1900000000450, "en": "Snitch (USA)", "senses": [{"pos": "sostantivo", "translations": ["spia", "spione", "informatore"]}], "categoryIds": []}, {"id": 1900000000451, "en": "Fence", "senses": [{"pos": "sostantivo", "translations": ["recinzione", "recinto", "staccionata", "ringhiera"]}], "categoryIds": []}, {"id": 1900000000452, "en": "Railing", "senses": [{"pos": "sostantivo", "translations": ["ringhiera"]}], "categoryIds": []}, {"id": 1900000000453, "en": "Case", "senses": [{"pos": "sostantivo", "translations": ["custodia"]}], "categoryIds": []}, {"id": 1900000000454, "en": "Void", "senses": [{"pos": "sostantivo", "translations": ["il vuoto"]}], "categoryIds": []}, {"id": 1900000000455, "en": "Empty", "senses": [{"pos": "aggettivo", "translations": ["vuoto"]}], "categoryIds": []}, {"id": 1900000000456, "en": "Paramount", "senses": [{"pos": "aggettivo", "translations": ["fondamentale", "importantissimo"]}], "categoryIds": []}, {"id": 1900000000457, "en": "Hunger", "senses": [{"pos": "sostantivo", "translations": ["fame"]}], "categoryIds": []}, {"id": 1900000000458, "en": "Hungry", "senses": [{"pos": "aggettivo", "translations": ["affamato"]}], "categoryIds": []}, {"id": 1900000000459, "en": "Starving", "senses": [{"pos": "modo di dire", "translations": ["avere una fame da lupi", "affamato"]}], "categoryIds": []}, {"id": 1900000000460, "en": "Starve", "senses": [{"pos": "verbo", "translations": ["morire di fame", "affamare"]}], "categoryIds": []}, {"id": 1900000000461, "en": "Slam", "senses": [{"pos": "verbo", "translations": ["sbattere"]}], "categoryIds": []}, {"id": 1900000000462, "en": "Effort", "senses": [{"pos": "sostantivo", "translations": ["sforzo"]}], "categoryIds": []}, {"id": 1900000000463, "en": "Cart", "senses": [{"pos": "sostantivo", "translations": ["carrello"]}], "categoryIds": []}, {"id": 1900000000464, "en": "Dare", "senses": [{"pos": "verbo", "translations": ["osare"]}], "categoryIds": []}, {"id": 1900000000465, "en": "Sue", "senses": [{"pos": "verbo", "translations": ["fare causa", "citare in giudizio"]}], "categoryIds": []}, {"id": 1900000000466, "en": "Deploy", "senses": [{"pos": "verbo", "translations": ["distribuire", "diffondere", "utilizzare", "schierare (military)"]}], "categoryIds": []}, {"id": 1900000000467, "en": "Width", "senses": [{"pos": "sostantivo", "translations": ["larghezza"]}], "categoryIds": []}, {"id": 1900000000468, "en": "Height", "senses": [{"pos": "sostantivo", "translations": ["altezza"]}], "categoryIds": []}, {"id": 1900000000469, "en": "Length", "senses": [{"pos": "sostantivo", "translations": ["lunghezza"]}], "categoryIds": []}, {"id": 1900000000470, "en": "Thickness", "senses": [{"pos": "sostantivo", "translations": ["spessore; profondità"]}], "categoryIds": []}, {"id": 1900000000471, "en": "Weight", "senses": [{"pos": "sostantivo", "translations": ["peso"]}], "categoryIds": []}, {"id": 1900000000472, "en": "Spread", "senses": [{"pos": "verbo", "translations": ["diffondere", "diffusione", "distribuire"]}], "categoryIds": []}, {"id": 1900000000473, "en": "Widespread", "senses": [{"pos": "aggettivo", "translations": ["diffuso"]}], "categoryIds": []}, {"id": 1900000000474, "en": "Achieve", "senses": [{"pos": "verbo", "translations": ["raggiungere un obiettivo/risultato", "ottenere", "realizzare"]}], "categoryIds": []}, {"id": 1900000000475, "en": "Reach", "senses": [{"pos": "verbo", "translations": ["raggiungere obiettivo risultato o elemento fisico"]}], "categoryIds": []}, {"id": 1900000000476, "en": "Splash", "senses": [{"pos": "sostantivo", "translations": ["schizzo", "schizzare", "spruzzo", "spruzzare"]}], "categoryIds": []}, {"id": 1900000000477, "en": "Spatter", "senses": [{"pos": "sostantivo", "translations": ["schizzo", "schizzare (piccolo splash)"]}], "categoryIds": []}, {"id": 1900000000478, "en": "Bucket", "senses": [{"pos": "sostantivo", "translations": ["secchio"]}], "categoryIds": []}, {"id": 1900000000479, "en": "Tape", "senses": [{"pos": "sostantivo", "translations": ["nastro"]}], "categoryIds": []}, {"id": 1900000000480, "en": "Drugged", "senses": [{"pos": "aggettivo", "translations": ["drogato"]}], "categoryIds": []}, {"id": 1900000000481, "en": "Snot", "senses": [{"pos": "sostantivo", "translations": ["moccio", "muco"]}], "categoryIds": []}, {"id": 1900000000482, "en": "Plain", "senses": [{"pos": "sostantivo", "translations": ["pianura; semplice", "schietto", "trasparente", "chiaro"]}], "categoryIds": []}, {"id": 1900000000483, "en": "Flat", "senses": [{"pos": "aggettivo", "translations": ["pianeggiante", "piano", "piatto"]}], "categoryIds": []}, {"id": 1900000000484, "en": "Dull", "senses": [{"pos": "aggettivo", "translations": ["noioso", "opaco", "spento"]}], "categoryIds": []}, {"id": 1900000000485, "en": "Pull", "senses": [{"pos": "verbo", "translations": ["tirare"]}], "categoryIds": []}, {"id": 1900000000486, "en": "Throw", "senses": [{"pos": "verbo", "translations": ["buttare", "lanciare", "gettare"]}], "categoryIds": []}, {"id": 1900000000487, "en": "Cast", "senses": [{"pos": "verbo", "translations": ["lanciare", "gettare (old-fashioned", "letteratura)"]}], "categoryIds": []}, {"id": 1900000000488, "en": "Launch", "senses": [{"pos": "verbo", "translations": ["lanciare (inviare", "iniziare", "partire", "dare inizio)"]}], "categoryIds": []}, {"id": 1900000000489, "en": "Take out / delete / remove", "senses": [{"pos": "modo di dire", "translations": ["eliminare", "togliere", "rimuovere"]}], "categoryIds": []}, {"id": 1900000000490, "en": "Garbage / trash / junk", "senses": [{"pos": "sostantivo", "translations": ["spazzatura"]}], "categoryIds": []}, {"id": 1900000000491, "en": "Attached", "senses": [{"pos": "aggettivo", "translations": ["allegato"]}], "categoryIds": []}, {"id": 1900000000492, "en": "E-mail attachment", "senses": [{"pos": "sostantivo", "translations": ["allegato mail"]}], "categoryIds": []}, {"id": 1900000000493, "en": "Insane", "senses": [{"pos": "aggettivo", "translations": ["folle", "pazzo", "assurdo"]}], "categoryIds": []}, {"id": 1900000000494, "en": "Throughout", "senses": [{"pos": "preposizione", "translations": ["per tutto", "in tutto"]}], "categoryIds": []}, {"id": 1900000000495, "en": "Compared to/with", "senses": [{"pos": "modo di dire", "translations": ["rispetto a"]}], "categoryIds": []}, {"id": 1900000000496, "en": "Fed up", "senses": [{"pos": "modo di dire", "translations": ["esasperato", "stufo"]}], "categoryIds": []}, {"id": 1900000000497, "en": "Top notch", "senses": [{"pos": "modo di dire", "translations": ["di prima qualità"]}], "categoryIds": []}, {"id": 1900000000498, "en": "Jeez / geez (slang)", "senses": [{"pos": "modo di dire", "translations": ["cavolo!", "accidenti!", "mannaggia"]}], "categoryIds": []}, {"id": 1900000000499, "en": "Mortgage", "senses": [{"pos": "sostantivo", "translations": ["mutuo", "ipoteca"]}], "categoryIds": []}, {"id": 1900000000500, "en": "Forehead", "senses": [{"pos": "sostantivo", "translations": ["fronte"]}], "categoryIds": []}, {"id": 1900000000501, "en": "Defy", "senses": [{"pos": "verbo", "translations": ["sfidare", "confrontarsi"]}], "categoryIds": []}, {"id": 1900000000502, "en": "Challenge", "senses": [{"pos": "verbo", "translations": ["sfidare"]}], "categoryIds": []}, {"id": 1900000000503, "en": "Beyond", "senses": [{"pos": "preposizione", "translations": ["oltre", "al di là; fuori della comprensione"]}], "categoryIds": []}, {"id": 1900000000504, "en": "Settler", "senses": [{"pos": "sostantivo", "translations": ["colono", "colonizzatore"]}], "categoryIds": []}, {"id": 1900000000505, "en": "Rubble", "senses": [{"pos": "sostantivo", "translations": ["macerie", "detriti"]}], "categoryIds": []}, {"id": 1900000000506, "en": "Debris", "senses": [{"pos": "sostantivo", "translations": ["detriti"]}], "categoryIds": []}, {"id": 1900000000507, "en": "Mandatory", "senses": [{"pos": "aggettivo", "translations": ["obbligatorio", "imperativo", "tassativo"]}], "categoryIds": []}, {"id": 1900000000508, "en": "Port", "senses": [{"pos": "sostantivo", "translations": ["porto grosso con scarico merce"]}], "categoryIds": []}, {"id": 1900000000509, "en": "Harbour", "senses": [{"pos": "sostantivo", "translations": ["porto con solo molo per attracco"]}], "categoryIds": []}, {"id": 1900000000510, "en": "Dock", "senses": [{"pos": "sostantivo", "translations": ["molo (in generale)"]}], "categoryIds": []}, {"id": 1900000000511, "en": "Pier", "senses": [{"pos": "sostantivo", "translations": ["molo perpendicolare alla costa costruito su pali"]}], "categoryIds": []}, {"id": 1900000000512, "en": "Jetty", "senses": [{"pos": "sostantivo", "translations": ["molo perpendicolare alla costa costruito su scogli"]}], "categoryIds": []}, {"id": 1900000000513, "en": "Quay", "senses": [{"pos": "sostantivo", "translations": ["molo parallelo alla costa"]}], "categoryIds": []}, {"id": 1900000000514, "en": "Wharf", "senses": [{"pos": "sostantivo", "translations": ["molo articolato che include piers e quays"]}], "categoryIds": []}, {"id": 1900000000515, "en": "Boat", "senses": [{"pos": "sostantivo", "translations": ["barca"]}], "categoryIds": []}, {"id": 1900000000516, "en": "Ship", "senses": [{"pos": "sostantivo", "translations": ["nave"]}], "categoryIds": []}, {"id": 1900000000517, "en": "Sail", "senses": [{"pos": "sostantivo", "translations": ["vela", "navigare", "salpare"]}], "categoryIds": []}, {"id": 1900000000518, "en": "Sailboat / Sailing boat", "senses": [{"pos": "sostantivo", "translations": ["barca a vela"]}], "categoryIds": []}, {"id": 1900000000519, "en": "Vessel", "senses": [{"pos": "sostantivo", "translations": ["vascello", "vaso"]}], "categoryIds": []}, {"id": 1900000000520, "en": "Oar", "senses": [{"pos": "sostantivo", "translations": ["remo lungo"]}], "categoryIds": []}, {"id": 1900000000521, "en": "Paddle", "senses": [{"pos": "sostantivo", "translations": ["remo più corto per canoa"]}], "categoryIds": []}, {"id": 1900000000522, "en": "Hull", "senses": [{"pos": "sostantivo", "translations": ["scafo"]}], "categoryIds": []}, {"id": 1900000000523, "en": "Sink", "senses": [{"pos": "verbo", "translations": ["affondare"]}], "categoryIds": []}, {"id": 1900000000524, "en": "Wreck", "senses": [{"pos": "sostantivo", "translations": ["relitto"]}], "categoryIds": []}, {"id": 1900000000525, "en": "Sailor / seaman", "senses": [{"pos": "sostantivo", "translations": ["marinaio"]}], "categoryIds": []}, {"id": 1900000000526, "en": "Helm / tiller", "senses": [{"pos": "sostantivo", "translations": ["timone (ruota di comando)"]}], "categoryIds": []}, {"id": 1900000000527, "en": "Rudder", "senses": [{"pos": "sostantivo", "translations": ["timone sott'acqua o sulle ali degli aerei"]}], "categoryIds": []}, {"id": 1900000000528, "en": "Anchor", "senses": [{"pos": "sostantivo", "translations": ["ancora"]}], "categoryIds": []}, {"id": 1900000000529, "en": "Shore", "senses": [{"pos": "sostantivo", "translations": ["riva"]}], "categoryIds": []}, {"id": 1900000000530, "en": "Buoy", "senses": [{"pos": "sostantivo", "translations": ["boa"]}], "categoryIds": []}, {"id": 1900000000531, "en": "Shallow", "senses": [{"pos": "aggettivo", "translations": ["superficiale", "poco profondo; persona superficiale"]}], "categoryIds": []}, {"id": 1900000000532, "en": "Deck", "senses": [{"pos": "sostantivo", "translations": ["ponte navale"]}], "categoryIds": []}, {"id": 1900000000533, "en": "Canoe", "senses": [{"pos": "sostantivo", "translations": ["canoa"]}], "categoryIds": []}, {"id": 1900000000534, "en": "Lighthouse", "senses": [{"pos": "sostantivo", "translations": ["faro"]}], "categoryIds": []}, {"id": 1900000000535, "en": "Ensure", "senses": [{"pos": "verbo", "translations": ["garantire", "assicurare"]}], "categoryIds": []}, {"id": 1900000000536, "en": "Through", "senses": [{"pos": "preposizione", "translations": ["attraverso", "tramite"]}], "categoryIds": []}, {"id": 1900000000537, "en": "Dwarf", "senses": [{"pos": "sostantivo", "translations": ["nano"]}], "categoryIds": []}, {"id": 1900000000538, "en": "Facade", "senses": [{"pos": "sostantivo", "translations": ["facciata"]}], "categoryIds": []}, {"id": 1900000000539, "en": "Splinter", "senses": [{"pos": "sostantivo", "translations": ["scheggia"]}], "categoryIds": []}, {"id": 1900000000540, "en": "Crunch", "senses": [{"pos": "verbo", "translations": ["scricchiolare", "sgranocchiare", "crisi"]}], "categoryIds": []}, {"id": 1900000000541, "en": "Crunch time", "senses": [{"pos": "modo di dire", "translations": ["momento critico/decisivo", "tempo di crisi"]}], "categoryIds": []}, {"id": 1900000000542, "en": "Crunchy", "senses": [{"pos": "aggettivo", "translations": ["croccante"]}], "categoryIds": []}, {"id": 1900000000543, "en": "Hit", "senses": [{"pos": "verbo", "translations": ["colpire"]}], "categoryIds": []}, {"id": 1900000000544, "en": "Affect", "senses": [{"pos": "verbo", "translations": ["colpito da un effetto; si usa in termini medici"]}], "categoryIds": []}, {"id": 1900000000545, "en": "Wander", "senses": [{"pos": "verbo", "translations": ["vagare"]}], "categoryIds": []}, {"id": 1900000000546, "en": "Bleach", "senses": [{"pos": "sostantivo", "translations": ["candeggina", "candeggiare"]}], "categoryIds": []}, {"id": 1900000000547, "en": "Wind up", "senses": [{"pos": "modo di dire", "translations": ["finire", "concludere", "avvolgere", "arrotolare"]}], "categoryIds": []}, {"id": 1900000000548, "en": "Wrap", "senses": [{"pos": "verbo", "translations": ["avvolgere", "confezionare", "impacchettare", "incartare"]}], "categoryIds": []}, {"id": 1900000000549, "en": "Pour", "senses": [{"pos": "verbo", "translations": ["versare intenzionalmente liquido"]}], "categoryIds": []}, {"id": 1900000000550, "en": "Spill", "senses": [{"pos": "verbo", "translations": ["versare accidentalmente", "fuoriuscire", "rovesciare liquido"]}], "categoryIds": []}, {"id": 1900000000551, "en": "Leak", "senses": [{"pos": "sostantivo", "translations": ["perdita", "fuoriuscita di liquido o dati"]}], "categoryIds": []}, {"id": 1900000000552, "en": "Loss", "senses": [{"pos": "sostantivo", "translations": ["perdita", "fuoriuscita"]}], "categoryIds": []}, {"id": 1900000000553, "en": "Breach", "senses": [{"pos": "sostantivo", "translations": ["violazione", "violare (data breach)"]}], "categoryIds": []}, {"id": 1900000000554, "en": "Violation", "senses": [{"pos": "sostantivo", "translations": ["violazione"]}], "categoryIds": []}, {"id": 1900000000555, "en": "Fewer", "senses": [{"pos": "aggettivo", "translations": ["meno - usato per nomi COUNTABLES"]}], "categoryIds": []}, {"id": 1900000000556, "en": "Less", "senses": [{"pos": "aggettivo", "translations": ["meno - usato per nomi UNCOUNTABLES"]}], "categoryIds": []}, {"id": 1900000000557, "en": "Paw", "senses": [{"pos": "sostantivo", "translations": ["zampa; toccare con zampa"]}], "categoryIds": []}, {"id": 1900000000558, "en": "Paperclip", "senses": [{"pos": "sostantivo", "translations": ["graffetta"]}], "categoryIds": []}, {"id": 1900000000559, "en": "Borrow", "senses": [{"pos": "verbo", "translations": ["prendere in prestito"]}], "categoryIds": []}, {"id": 1900000000560, "en": "Braces", "senses": [{"pos": "sostantivo", "translations": ["apparecchio dentale", "parentesi graffa"]}], "categoryIds": []}, {"id": 1900000000561, "en": "Brace", "senses": [{"pos": "sostantivo", "translations": ["tutore ortopedico"]}], "categoryIds": []}, {"id": 1900000000562, "en": "Guarantee", "senses": [{"pos": "sostantivo", "translations": ["garanzia (promessa verbale)"]}], "categoryIds": []}, {"id": 1900000000563, "en": "Warranty", "senses": [{"pos": "sostantivo", "translations": ["garanzia (contratto scritto)"]}], "categoryIds": []}, {"id": 1900000000564, "en": "Regard", "senses": [{"pos": "sostantivo", "translations": ["riguardo", "proposito", "considerare", "saluti"]}], "categoryIds": []}, {"id": 1900000000565, "en": "with regard to", "senses": [{"pos": "modo di dire", "translations": ["per quanto riguarda"]}], "categoryIds": []}, {"id": 1900000000566, "en": "Concern", "senses": [{"pos": "sostantivo", "translations": ["riguardare", "preoccupazione (formale)"]}], "categoryIds": []}, {"id": 1900000000567, "en": "Is about", "senses": [{"pos": "modo di dire", "translations": ["riguardare", "parlare di"]}], "categoryIds": []}, {"id": 1900000000568, "en": "Toward / towards", "senses": [{"pos": "preposizione", "translations": ["verso"]}], "categoryIds": []}, {"id": 1900000000569, "en": "Herd", "senses": [{"pos": "sostantivo", "translations": ["mandria", "gregge; grande gruppo di persone"]}], "categoryIds": []}, {"id": 1900000000570, "en": "Flock", "senses": [{"pos": "sostantivo", "translations": ["stormo (di uccelli)", "gregge (di pecore o capre)"]}], "categoryIds": []}, {"id": 1900000000571, "en": "Crowd", "senses": [{"pos": "sostantivo", "translations": ["folla", "affollato"]}], "categoryIds": []}, {"id": 1900000000572, "en": "Cull", "senses": [{"pos": "verbo", "translations": ["abbattimento selettivo", "selezionare"]}], "categoryIds": []}, {"id": 1900000000573, "en": "Puddle", "senses": [{"pos": "sostantivo", "translations": ["pozzanghera"]}], "categoryIds": []}, {"id": 1900000000574, "en": "Crisp / Crunchy", "senses": [{"pos": "aggettivo", "translations": ["croccante", "netto", "preciso"]}], "categoryIds": []}, {"id": 1900000000575, "en": "Accurate", "senses": [{"pos": "aggettivo", "translations": ["preciso"]}], "categoryIds": []}, {"id": 1900000000576, "en": "Row", "senses": [{"pos": "sostantivo", "translations": ["fila", "filare di impiante (line of persons seats plants...)"]}], "categoryIds": []}, {"id": 1900000000577, "en": "Queue", "senses": [{"pos": "sostantivo", "translations": ["coda (di attesa)"]}], "categoryIds": []}, {"id": 1900000000578, "en": "Stampede", "senses": [{"pos": "sostantivo", "translations": ["fuga disordinata", "fuggi fuggi", "assalto"]}], "categoryIds": []}, {"id": 1900000000579, "en": "Fellow", "senses": [{"pos": "sostantivo", "translations": ["tizio", "tale", "persona", "socio", "collega", "compagno"]}], "categoryIds": []}, {"id": 1900000000580, "en": "Fellas (slang)", "senses": [{"pos": "sostantivo", "translations": ["gruppo di ragazzi", "amici"]}], "categoryIds": []}, {"id": 1900000000581, "en": "Dude (slang)", "senses": [{"pos": "sostantivo", "translations": ["tipo", "tizio", "amico", "fratello"]}], "categoryIds": []}, {"id": 1900000000582, "en": "Goosebumps / goose pimples", "senses": [{"pos": "sostantivo", "translations": ["pelle d'oca"]}], "categoryIds": []}, {"id": 1900000000583, "en": "Under", "senses": [{"pos": "preposizione", "translations": ["sotto (quasi sempre preposizione)"]}], "categoryIds": []}, {"id": 1900000000584, "en": "Below", "senses": [{"pos": "preposizione", "translations": ["sotto (uno molto più in basso dell'altro)"]}], "categoryIds": []}, {"id": 1900000000585, "en": "Underneath", "senses": [{"pos": "preposizione", "translations": ["sotto (può essere preposizione o avverbio)"]}], "categoryIds": []}, {"id": 1900000000586, "en": "Beneath", "senses": [{"pos": "preposizione", "translations": ["sotto (più formale di under o below)"]}], "categoryIds": []}, {"id": 1900000000587, "en": "Witness", "senses": [{"pos": "sostantivo", "translations": ["testimone", "essere testimone", "assistere"]}], "categoryIds": []}, {"id": 1900000000588, "en": "Replace", "senses": [{"pos": "verbo", "translations": ["sostituire", "mettere a posto", "rimpiazzare"]}], "categoryIds": []}, {"id": 1900000000589, "en": "Lid", "senses": [{"pos": "sostantivo", "translations": ["coperchio"]}], "categoryIds": []}, {"id": 1900000000590, "en": "Leisure", "senses": [{"pos": "sostantivo", "translations": ["tempo libero; con comodo"]}], "categoryIds": []}, {"id": 1900000000591, "en": "For example / for instance / such as", "senses": [{"pos": "modo di dire", "translations": ["per esempio", "per esempio", "come"]}], "categoryIds": []}, {"id": 1900000000592, "en": "Discuss / talk about", "senses": [{"pos": "verbo", "translations": ["discutere"]}], "categoryIds": []}, {"id": 1900000000593, "en": "Argue", "senses": [{"pos": "verbo", "translations": ["discutere", "litigare", "bisticciare"]}], "categoryIds": []}, {"id": 1900000000594, "en": "On my own / By myself", "senses": [{"pos": "modo di dire", "translations": ["da solo", "per conto mio"]}], "categoryIds": []}, {"id": 1900000000595, "en": "Breath", "senses": [{"pos": "sostantivo", "translations": ["respiro", "fiato", "alito"]}], "categoryIds": []}, {"id": 1900000000596, "en": "Breathe", "senses": [{"pos": "verbo", "translations": ["respirare"]}], "categoryIds": []}, {"id": 1900000000597, "en": "Stunning / breathtaking", "senses": [{"pos": "aggettivo", "translations": ["mozzafiato", "splendido"]}], "categoryIds": []}, {"id": 1900000000598, "en": "Quiet", "senses": [{"pos": "aggettivo", "translations": ["tranquillo"]}], "categoryIds": []}, {"id": 1900000000599, "en": "Glacier", "senses": [{"pos": "sostantivo", "translations": ["ghiacciaio"]}], "categoryIds": []}, {"id": 1900000000600, "en": "Savior / Saviour", "senses": [{"pos": "sostantivo", "translations": ["salvatore (rescuer", "religious)"]}], "categoryIds": []}, {"id": 1900000000601, "en": "Rent / Hire", "senses": [{"pos": "verbo", "translations": ["noleggiare"]}], "categoryIds": []}, {"id": 1900000000602, "en": "Rental", "senses": [{"pos": "sostantivo", "translations": ["(il) noleggio"]}], "categoryIds": []}, {"id": 1900000000603, "en": "Insurance", "senses": [{"pos": "sostantivo", "translations": ["assicurazione"]}], "categoryIds": []}, {"id": 1900000000604, "en": "Insured", "senses": [{"pos": "aggettivo", "translations": ["assicurato"]}], "categoryIds": []}, {"id": 1900000000605, "en": "Deductible", "senses": [{"pos": "sostantivo", "translations": ["franchigia"]}], "categoryIds": []}, {"id": 1900000000606, "en": "Pick up", "senses": [{"pos": "modo di dire", "translations": ["ritirare", "raccogliere", "rimorchiare"]}], "categoryIds": []}, {"id": 1900000000607, "en": "Drop off", "senses": [{"pos": "modo di dire", "translations": ["lasciare", "consegnare", "riconsegnare"]}], "categoryIds": []}, {"id": 1900000000608, "en": "Damage", "senses": [{"pos": "sostantivo", "translations": ["danno"]}], "categoryIds": []}, {"id": 1900000000609, "en": "Tank", "senses": [{"pos": "sostantivo", "translations": ["serbatoio"]}], "categoryIds": []}, {"id": 1900000000610, "en": "Boot (uk) / Trunk (am)", "senses": [{"pos": "sostantivo", "translations": ["bagagliaio"]}], "categoryIds": []}, {"id": 1900000000611, "en": "Bonnet (uk) / Hood (us)", "senses": [{"pos": "sostantivo", "translations": ["cofano", "cappuccio"]}], "categoryIds": []}, {"id": 1900000000612, "en": "Plate", "senses": [{"pos": "sostantivo", "translations": ["targa", "piatto", "piastra"]}], "categoryIds": []}, {"id": 1900000000613, "en": "Automatic (transmission)", "senses": [{"pos": "sostantivo", "translations": ["cambio automatico"]}], "categoryIds": []}, {"id": 1900000000614, "en": "Dent", "senses": [{"pos": "sostantivo", "translations": ["ammaccatura", "bozza"]}], "categoryIds": []}, {"id": 1900000000615, "en": "Bump", "senses": [{"pos": "sostantivo", "translations": ["bozza", "protuberanza", "urto"]}], "categoryIds": []}, {"id": 1900000000616, "en": "Body (car)", "senses": [{"pos": "sostantivo", "translations": ["carrozzeria"]}], "categoryIds": []}, {"id": 1900000000617, "en": "Accident / crash / collision", "senses": [{"pos": "sostantivo", "translations": ["incidente"]}], "categoryIds": []}, {"id": 1900000000618, "en": "Bumper", "senses": [{"pos": "sostantivo", "translations": ["paraurti"]}], "categoryIds": []}, {"id": 1900000000619, "en": "Steering Wheel", "senses": [{"pos": "sostantivo", "translations": ["volante", "sterzo"]}], "categoryIds": []}, {"id": 1900000000620, "en": "Brake", "senses": [{"pos": "sostantivo", "translations": ["freno"]}], "categoryIds": []}, {"id": 1900000000621, "en": "Tire (US) / Tyre (UK)", "senses": [{"pos": "sostantivo", "translations": ["pneumatico"]}], "categoryIds": []}, {"id": 1900000000622, "en": "Engine", "senses": [{"pos": "sostantivo", "translations": ["motore"]}], "categoryIds": []}, {"id": 1900000000623, "en": "Gear", "senses": [{"pos": "sostantivo", "translations": ["marcia; ingranaggio; attrezzatura"]}], "categoryIds": []}, {"id": 1900000000624, "en": "Fuel", "senses": [{"pos": "sostantivo", "translations": ["carburante", "combustibile"]}], "categoryIds": []}, {"id": 1900000000625, "en": "Petrol / gasoline / gas", "senses": [{"pos": "sostantivo", "translations": ["benzina"]}], "categoryIds": []}, {"id": 1900000000626, "en": "Gas station / Petrol station", "senses": [{"pos": "sostantivo", "translations": ["benzinato"]}], "categoryIds": []}, {"id": 1900000000627, "en": "Headlight", "senses": [{"pos": "sostantivo", "translations": ["faro"]}], "categoryIds": []}, {"id": 1900000000628, "en": "Seat", "senses": [{"pos": "sostantivo", "translations": ["sedile"]}], "categoryIds": []}, {"id": 1900000000629, "en": "Back mirror", "senses": [{"pos": "sostantivo", "translations": ["specchietto"]}], "categoryIds": []}, {"id": 1900000000630, "en": "Indicators", "senses": [{"pos": "sostantivo", "translations": ["frecce"]}], "categoryIds": []}, {"id": 1900000000631, "en": "Air conditioning", "senses": [{"pos": "sostantivo", "translations": ["aria condizionata"]}], "categoryIds": []}, {"id": 1900000000632, "en": "Tow Truck / Breakdown vehicle", "senses": [{"pos": "sostantivo", "translations": ["Carro Attrezzi"]}], "categoryIds": []}, {"id": 1900000000633, "en": "Truck (US) / Lorry (UK)", "senses": [{"pos": "sostantivo", "translations": ["camion"]}], "categoryIds": []}, {"id": 1900000000634, "en": "Overtake / Pass", "senses": [{"pos": "verbo", "translations": ["sorpassare", "superare"]}], "categoryIds": []}, {"id": 1900000000635, "en": "I'm running out of gas", "senses": [{"pos": "modo di dire", "translations": ["devo andare a fare benzina"]}], "categoryIds": []}, {"id": 1900000000636, "en": "I need to fill up", "senses": [{"pos": "modo di dire", "translations": ["devo riempire il serbatoio"]}], "categoryIds": []}, {"id": 1900000000637, "en": "Take off", "senses": [{"pos": "modo di dire", "translations": ["decollare"]}], "categoryIds": []}, {"id": 1900000000638, "en": "Land", "senses": [{"pos": "verbo", "translations": ["atterrare"]}], "categoryIds": []}, {"id": 1900000000639, "en": "Suitcase(s)", "senses": [{"pos": "sostantivo", "translations": ["valigia/e (countable)"]}], "categoryIds": []}, {"id": 1900000000640, "en": "Luggage / Baggage", "senses": [{"pos": "sostantivo", "translations": ["bagagli (parola plurale uncountable)"]}], "categoryIds": []}, {"id": 1900000000641, "en": "Hand baggage / Carry on baggage", "senses": [{"pos": "sostantivo", "translations": ["bagaglio a mano"]}], "categoryIds": []}, {"id": 1900000000642, "en": "Hold baggage", "senses": [{"pos": "sostantivo", "translations": ["bagaglio da stiva"]}], "categoryIds": []}, {"id": 1900000000643, "en": "Checked baggage", "senses": [{"pos": "sostantivo", "translations": ["bagaglio registrato / in stiva"]}], "categoryIds": []}, {"id": 1900000000644, "en": "Runway / Airstrip", "senses": [{"pos": "sostantivo", "translations": ["pista di atterraggio"]}], "categoryIds": []}, {"id": 1900000000645, "en": "Duty free", "senses": [{"pos": "aggettivo", "translations": ["esente da dazio"]}], "categoryIds": []}, {"id": 1900000000646, "en": "Flight", "senses": [{"pos": "sostantivo", "translations": ["volo"]}], "categoryIds": []}, {"id": 1900000000647, "en": "Flight attendant", "senses": [{"pos": "sostantivo", "translations": ["assistente di volo"]}], "categoryIds": []}, {"id": 1900000000648, "en": "Round trip", "senses": [{"pos": "sostantivo", "translations": ["andata e ritorno"]}], "categoryIds": []}, {"id": 1900000000649, "en": "Window seat", "senses": [{"pos": "sostantivo", "translations": ["posto finestrino"]}], "categoryIds": []}, {"id": 1900000000650, "en": "Aisle", "senses": [{"pos": "sostantivo", "translations": ["corridoio", "navata (Aisle seat)"]}], "categoryIds": []}, {"id": 1900000000651, "en": "Pinkie / little finger", "senses": [{"pos": "sostantivo", "translations": ["mignolo"]}], "categoryIds": []}, {"id": 1900000000652, "en": "Survey", "senses": [{"pos": "sostantivo", "translations": ["sondaggio"]}], "categoryIds": []}, {"id": 1900000000653, "en": "Make/Get worse", "senses": [{"pos": "modo di dire", "translations": ["peggiorare"]}], "categoryIds": []}, {"id": 1900000000654, "en": "Sick", "senses": [{"pos": "aggettivo", "translations": ["malato", "sentirsi male; disgustoso; figo (slang)"]}], "categoryIds": []}, {"id": 1900000000655, "en": "Be sick", "senses": [{"pos": "modo di dire", "translations": ["vomitare", "avere la nausea"]}], "categoryIds": []}, {"id": 1900000000656, "en": "Feel sick", "senses": [{"pos": "modo di dire", "translations": ["avere la nausea", "nauseato"]}], "categoryIds": []}, {"id": 1900000000657, "en": "Sick of", "senses": [{"pos": "modo di dire", "translations": ["stanco", "stufo", "non poterne più di"]}], "categoryIds": []}, {"id": 1900000000658, "en": "Accomplish", "senses": [{"pos": "verbo", "translations": ["compiere", "realizzare", "raggiungere"]}], "categoryIds": []}];

const PRELOADED = PRELOADED_RAW.map(c => ({ ...c, source: "sheet", examples: c.examples || [] }));

function newSense() { return { id: Math.random().toString(36).slice(2), pos:"sostantivo", text:"" }; }

// Normalizes an English word/phrase for matching purposes: lowercases, strips parenthetical
// notes and punctuation, and trims common suffix variations (-ing, -ed, -s, -es, -ies) word by
// word — so "Beat a dead horse" and "Beating a dead horse" are recognized as the same entry.
// This is only used to DETECT matches; the original text is always what's kept/displayed.
function stemWord(w) {
  if (!/^[a-z]+$/.test(w)) return w; // leave numbers/apostrophes/etc. untouched
  if (w.length > 5 && w.endsWith("ing")) return w.slice(0, -3);
  if (w.length > 5 && w.endsWith("ies")) return w.slice(0, -3) + "y";
  if (w.length > 4 && /(ches|shes|xes|sses|zes)$/.test(w)) return w.slice(0, -2); // boxes, classes, wishes
  if (w.length > 4 && w.endsWith("ed")) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
  return w;
}
function normalizeForMatch(str) {
  return str
    .toLowerCase()
    .replace(/[\u2018\u2019\u02BC\u0060\u00B4]/g, "'") // treat curly/typographic apostrophes (’ ‘ ʼ ` ´) as the straight one — Google Sheets auto-converts ' to ’, which otherwise breaks duplicate detection
    .replace(/\([^)]*\)/g, " ")      // drop parenthetical notes like "(usa)", "(uk)"
    .replace(/[^a-z0-9'\s]/g, " ")   // drop punctuation
    .split(/\s+/)
    .filter(Boolean)
    .map(stemWord)
    .join(" ")
    .trim();
}

// Merges freshly-imported entries into the existing card list while respecting the sheet's order:
// existing words are updated in place (same position), and brand-new words are inserted right next
// to whichever existing word they were adjacent to in the pasted/sheet sequence — instead of always
// being appended at the very end.
function mergeCardsPreservingOrder(existingCards, entries, buildCard) {
  const indexByKey = new Map();
  existingCards.forEach((c, i) => indexByKey.set(normalizeForMatch(c.en), i));

  const result = existingCards.slice();

  // figure out, per pasted entry, whether it matches an existing card
  const matchIndex = entries.map(e => {
    const key = normalizeForMatch(e.en);
    return indexByKey.has(key) ? indexByKey.get(key) : null;
  });

  // update matched entries in place, keeping their position
  entries.forEach((entry, i) => {
    if (matchIndex[i] !== null) result[matchIndex[i]] = buildCard(entry, result[matchIndex[i]]);
  });

  // for each new (unmatched) entry, find the nearest existing anchor BEFORE it in the pasted
  // sequence, and the nearest one AFTER it — so a run of new words with no earlier anchor
  // (e.g. right at the start of what you pasted) still lands next to the closest known word
  // instead of defaulting to the very top of the whole list.
  const n = entries.length;
  const afterAnchor = new Array(n).fill(-1);
  let lastSeen = -1;
  for (let i = 0; i < n; i++) {
    if (matchIndex[i] !== null) lastSeen = matchIndex[i];
    afterAnchor[i] = lastSeen;
  }
  const beforeAnchor = new Array(n).fill(null);
  let nextSeen = null;
  for (let i = n - 1; i >= 0; i--) {
    if (matchIndex[i] !== null) nextSeen = matchIndex[i];
    beforeAnchor[i] = nextSeen;
  }

  const groups = new Map();
  entries.forEach((entry, i) => {
    if (matchIndex[i] !== null) return;
    let anchor;
    if (afterAnchor[i] !== -1) anchor = afterAnchor[i];               // insert right after the nearest known word before it
    else if (beforeAnchor[i] !== null) anchor = beforeAnchor[i] - 1;  // no word before it yet -> insert right before the next known word
    else anchor = existingCards.length - 1;                           // no anchors anywhere in this paste -> append at the end
    if (!groups.has(anchor)) groups.set(anchor, []);
    groups.get(anchor).push(buildCard(entry, null));
  });

  const anchors = Array.from(groups.keys()).sort((a, b) => b - a);
  anchors.forEach(a => result.splice(a + 1, 0, ...groups.get(a)));

  return result;
}

// Used only by the full-sheet sync (not the paste-import flow, which is usually a partial copy).
// Re-lays out the ENTIRE list to match the sheet's current top-to-bottom order, including words
// that were already synced before but have since been moved around in the sheet. Cards that don't
// appear in this sync's data at all (manually added words, entries from another tab, leftovers from
// a paste-import, etc.) are "orphans" — they're re-anchored right after whichever synced word they
// used to sit next to, so a full resync also picks up manual reordering without losing anything.
function mergeCardsFullReorder(existingCards, entries, buildCard) {
  const oldIndexByKey = new Map();
  existingCards.forEach((c, i) => oldIndexByKey.set(normalizeForMatch(c.en), i));
  const entryKeySet = new Set(entries.map(e => normalizeForMatch(e.en)));

  // New backbone: strictly the sheet's current order, reusing id/categories/examples from any
  // matching existing card via buildCard(entry, old).
  const backbone = entries.map(entry => {
    const key = normalizeForMatch(entry.en);
    const old = oldIndexByKey.has(key) ? existingCards[oldIndexByKey.get(key)] : null;
    return buildCard(entry, old);
  });
  const newIndexByKey = new Map();
  backbone.forEach((c, i) => newIndexByKey.set(normalizeForMatch(c.en), i));

  // Group orphans by the nearest synced neighbor that preceded them in the OLD order.
  const groups = new Map(); // anchorNewIndex (-1 = very start of list) -> [cards]
  existingCards.forEach((c, i) => {
    const key = normalizeForMatch(c.en);
    if (entryKeySet.has(key)) return; // not an orphan, it's part of the new backbone already
    let anchor = -1;
    for (let j = i - 1; j >= 0; j--) {
      const pk = normalizeForMatch(existingCards[j].en);
      if (newIndexByKey.has(pk)) { anchor = newIndexByKey.get(pk); break; }
    }
    if (!groups.has(anchor)) groups.set(anchor, []);
    groups.get(anchor).push(c);
  });

  const result = backbone.slice();
  const orphanAnchors = Array.from(groups.keys()).sort((a, b) => b - a); // descending, -1 last
  orphanAnchors.forEach(a => result.splice(a + 1, 0, ...groups.get(a)));

  return result;
}
function uid()      { return "cat-" + Date.now() + Math.random().toString(36).slice(2); }

const API_KEY_STORAGE = "vocab-gemini-api-key";
function getApiKey() { return localStorage.getItem(API_KEY_STORAGE) || ""; }
function setApiKey(key) { localStorage.setItem(API_KEY_STORAGE, key); }
const GEMINI_MODEL = "gemini-3.5-flash-lite";

const SHEET_URL_STORAGE = "vocab-sheet-csv-url";
function getSheetUrl() { return localStorage.getItem(SHEET_URL_STORAGE) || ""; }
function setSheetUrl(url) { localStorage.setItem(SHEET_URL_STORAGE, url); }

// Groups raw CSV lines back into logical records, keeping quoted multi-line cells intact.
function splitCsvIntoRecords(text) {
  const rawLines = text.split(/\r\n|\n/);
  const records = [];
  let buffer = "", quoteCount = 0;
  for (const line of rawLines) {
    buffer = buffer ? buffer + "\n" + line : line;
    quoteCount += (line.match(/"/g) || []).length;
    if (quoteCount % 2 === 0) { records.push(buffer); buffer = ""; quoteCount = 0; }
  }
  if (buffer) records.push(buffer);
  return records;
}
function chunkCsvRecords(records, perChunk = 150) {
  const chunks = [];
  for (let i = 0; i < records.length; i += perChunk) chunks.push(records.slice(i, i + perChunk).join("\n"));
  return chunks;
}

// Simple localStorage-backed replacement for localDb (works standalone, no Claude environment needed).
const localDb = {
  async get(key) {
    const v = localStorage.getItem(key);
    return v === null ? null : { key, value: v };
  },
  async set(key, value) {
    localStorage.setItem(key, value);
    return { key, value };
  }
};

// Calls Google's free-tier Gemini API. Returns the raw text of the model's reply.
async function callGemini(prompt, maxTokens) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("NO_API_KEY");
  const body = { contents: [{ parts: [{ text: prompt }] }] };
  if (maxTokens) body.generationConfig = { maxOutputTokens: maxTokens };
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `Errore API Gemini (${res.status})`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join("") || "";
  return text;
}

// ─── fetchExamples ────────────────────────────────────────────────────────────
async function fetchExamplesForCard(card) {
  const desc = card.senses.map(s=>`${s.pos}: ${s.translations.slice(0,4).join(", ")}`).join(" | ");
  const text = await callGemini(
    `The English word/expression "${card.en}" has these Italian meanings recorded (used only as a hint, they may be incomplete or mix multiple grammatical roles together): ${desc}\n\n`+
    `First, identify ALL the common distinct grammatical roles this English word/expression actually has (e.g. it might work as both a noun AND a verb, or have other senses not fully reflected in the hint above — for instance "strike" is both a noun meaning "sciopero" and a verb meaning "colpire"). Don't limit yourself to only what's listed in the hint if the word genuinely has more roles in common English usage.\n`+
    `Then, for EACH grammatical role you identified, give exactly THREE short natural example sentences in that role. The 3 sentences for the same role must be meaningfully different from each other (different context, subject, or situation) — not just the same sentence with a word swapped, and ideally illustrating different specific meanings within that role if the word has more than one (e.g. for the noun role of "strike": one example for "sciopero", one for "colpo/attacco", one for something else if applicable).\n`+
    `For each example also give "meaning": the SHORT specific Italian word or phrase (1-3 words, not a full sentence) that this particular example is illustrating.\n`+
    `Reply ONLY with a valid JSON array, no markdown. Group format:\n`+
    `[{"pos":"sostantivo","meaning":"sciopero","en":"Example one.","it":"Esempio uno."},{"pos":"sostantivo","meaning":"colpo","en":"Example two.","it":"Esempio due."},{"pos":"sostantivo","meaning":"attacco","en":"Example three.","it":"Esempio tre."},{"pos":"verbo","meaning":"colpire","en":"Example one.","it":"Esempio uno."},...]. Use only these pos labels: sostantivo, verbo, aggettivo, avverbio, "modo di dire", altro.`
  );
  const clean = text.trim().replace(/^```json\s*|^```\s*|```$/g,"");
  return JSON.parse(clean);
}

// ─── fetchVerbBatch ────────────────────────────────────────────────────────────
async function fetchVerbBatch() {
  const text = await callGemini(
    `Generate a batch of 7 English verb-tense practice exercises for an Italian learner at CEFR B2 level. Mix past, present, and future tenses across the batch (do not use the same tense for every item) and vary subjects/persons naturally.\n`+
    `Create TWO exercise types, roughly half and half, interleaved:\n`+
    `1) "blank" type: a natural English sentence with exactly ONE verb blanked out (write the blank as "___" inside the sentence), testing the correct conjugated form for that tense/context. Also give "infinitive": the bare infinitive of that verb without "to". Give "answer": the single correct conjugated form (just the verb, not the whole sentence).\n`+
    `2) "translate" type: a natural Italian sentence ("it") built around a verb in one of the target tenses, to be translated into English by the learner. Give "en": one natural, idiomatic reference English translation.\n`+
    `Reply ONLY with a valid JSON array, no markdown, no commentary. Format:\n`+
    `[{"type":"blank","sentence":"She ___ to the market yesterday.","infinitive":"go","answer":"went"},`+
    `{"type":"translate","it":"Lei andava al mercato ogni giorno.","en":"She used to go to the market every day."}]`
  );
  const clean = text.trim().replace(/^```json\s*|^```\s*|```$/g,"");
  const batch = JSON.parse(clean);
  return batch.sort(()=>Math.random()-0.5);
}

// ─── WordDetail ───────────────────────────────────────────────────────────────
function WordDetail({ card, feedbackBadge, onClose }) {
  const [examples, setExamples] = useState(null);
  useEffect(() => {
    let cancelled = false;
    if (!getApiKey()) { setExamples({sentences:[], noKey:true}); return; }
    setExamples({loading:true});
    fetchExamplesForCard(card)
      .then(s=>{ if(!cancelled) setExamples({sentences:s}); })
      .catch(e=>{ if(!cancelled) setExamples({sentences:[], error: e.message || String(e)}); });
    return ()=>{ cancelled=true; };
  }, [card.id]);

  async function regenerate() {
    if (!getApiKey()) { setExamples({sentences:[], noKey:true}); return; }
    setExamples({loading:true});
    try { setExamples({sentences: await fetchExamplesForCard(card)}); }
    catch (e) { setExamples({sentences:[], error: e.message || String(e)}); }
  }

  return (
    <div style={{background:"#FAF7F2",borderRadius:10,padding:"14px 16px",marginTop:14,textAlign:"left"}}>
      {feedbackBadge}
      <div style={{background:"#fff",border:"1px solid #EFE8DC",borderRadius:8,padding:"12px 14px",marginBottom:12}}>
        <div style={{fontSize:11,fontWeight:700,letterSpacing:1,color:"#9C8F7A",marginBottom:8}}>TUTTE LE TRADUZIONI</div>
        <div style={{fontSize:16,fontWeight:700,marginBottom:8,color:"#1F1A16"}}>{card.en}</div>
        {card.senses.map((s,i)=>(
          <div key={i} style={{fontSize:14,color:"#3A3028",marginBottom:4,display:"flex",gap:8,alignItems:"baseline"}}>
            {s.pos!=="altro"&&<span style={{color:"#B5562B",fontStyle:"italic",fontSize:12,flexShrink:0,minWidth:28}}>{POS_LABEL[s.pos]||s.pos}</span>}
            <span>{s.translations.join(", ")}</span>
          </div>
        ))}
      </div>
      <div style={{background:"#fff",border:"1px solid #EFE8DC",borderRadius:8,padding:"12px 14px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:1,color:"#9C8F7A"}}>ESEMPI</div>
          {!examples?.loading&&(
            <button onClick={regenerate} style={{background:"transparent",color:"#8A7D68",display:"flex",alignItems:"center",gap:4,fontSize:12,padding:0}}>
              <RefreshCw size={12}/> Genera altri
            </button>
          )}
        </div>
        {(() => {
          const sheetExamples = (card.examples||[]).filter(ex=>ex.en);
          const aiSentences = examples?.sentences || [];
          const hasAny = sheetExamples.length>0 || aiSentences.length>0;
          if (!hasAny && !examples?.loading) return <div style={{fontSize:13,color:examples?.error?"#B5562B":"#9C8F7A"}}>{examples?.noKey ? "Aggiungi la tua chiave API nelle Impostazioni ⚙️ per generare esempi." : examples?.error ? `Errore: ${examples.error}` : "Nessun esempio disponibile."}</div>;
          return (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {sheetExamples.map((ex,i)=>(
                <div key={`sheet-${i}`} style={{borderLeft:"3px solid #B5562B",paddingLeft:10}}>
                  <div style={{fontSize:10,color:"#9C8F7A",fontWeight:700,letterSpacing:0.5,marginBottom:2}}>DAL FOGLIO</div>
                  <div style={{fontSize:14,fontStyle:"italic",color:"#2B2521"}}>{ex.en}</div>
                  {ex.it&&<div style={{fontSize:13,color:"#7A6E63",marginTop:2}}>{ex.it}</div>}
                </div>
              ))}
              {examples?.loading ? (
                <div style={{display:"flex",alignItems:"center",gap:8,color:"#9C8F7A",fontSize:13}}>
                  <Loader2 size={14} className="spin"/> Sto generando esempi...
                </div>
              ) : aiSentences.map((ex,i)=>(
                <div key={`ai-${i}`} style={{borderLeft:"3px solid #E7CBB8",paddingLeft:10}}>
                  {ex.pos&&ex.pos!=="altro"&&<div style={{fontSize:11,color:"#B5562B",fontStyle:"italic",marginBottom:2}}>{POS_LABEL[ex.pos]||ex.pos}{ex.meaning&&<span style={{color:"#9C8F7A",fontStyle:"normal"}}> ({ex.meaning})</span>}</div>}
                  <div style={{fontSize:14,fontStyle:"italic",color:"#2B2521"}}>{ex.en}</div>
                  <div style={{fontSize:13,color:"#7A6E63",marginTop:2}}>{ex.it}</div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
      {onClose&&(
        <button onClick={onClose} style={{marginTop:10,background:"transparent",color:"#8A7D68",fontSize:13,display:"flex",alignItems:"center",gap:4}}>
          <ChevronLeft size={14}/> Chiudi
        </button>
      )}
    </div>
  );
}

// ─── ConfirmModal ─────────────────────────────────────────────────────────────
function ConfirmModal({ word, onConfirm, onCancel }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:24}}>
      <div style={{background:"#fff",borderRadius:14,padding:28,maxWidth:360,width:"100%",boxShadow:"0 8px 40px rgba(0,0,0,0.18)"}}>
        <div style={{fontSize:17,fontWeight:700,marginBottom:10,color:"#1F1A16"}}>Eliminare questa parola?</div>
        <div style={{fontSize:14,color:"#5C5246",marginBottom:24}}>Stai per eliminare <strong>"{word}"</strong>. L'azione non può essere annullata.</div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <button onClick={onCancel} style={{background:"transparent",color:"#5C5246",border:"1px solid #DDD3C2",borderRadius:7,padding:"9px 18px",fontWeight:600,fontSize:14}}>Annulla</button>
          <button onClick={onConfirm} style={{background:"#B5562B",color:"#fff",borderRadius:7,padding:"9px 18px",fontWeight:600,fontSize:14}}>Elimina</button>
        </div>
      </div>
    </div>
  );
}

// ─── CategoryDropdown ─────────────────────────────────────────────────────────
function CategoryDropdown({ cardId, cardCatIds, categories, onToggle, onCreateCategory }) {
  const [open, setOpen]       = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (btnRef.current && btnRef.current.contains(e.target)) return;
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      setOpen(false); setCreating(false); setNewName("");
    }
    function handleScroll() { setOpen(false); }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      // Only close on scroll when not in the "create category" input — on mobile, focusing
      // that input makes the browser auto-scroll it into view above the keyboard, which would
      // otherwise be mistaken for the user scrolling the list and close the menu instantly.
      if (!creating) window.addEventListener("scroll", handleScroll, true);
    }
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open, creating]);

  function openMenu() {
    const rect = btnRef.current.getBoundingClientRect();
    const menuWidth = 200;
    const left = Math.min(Math.max(8, rect.right - menuWidth), window.innerWidth - menuWidth - 8);
    setPos({ top: rect.bottom + 4, left });
    setOpen(true);
  }

  function handleCreate() {
    if (!newName.trim()) return;
    onCreateCategory(cardId, newName.trim());
    setNewName(""); setCreating(false); setOpen(false);
  }

  const activeCats = categories.filter(c => (cardCatIds||[]).includes(c.id));

  return (
    <div style={{position:"relative"}} onClick={e=>e.stopPropagation()}>
      <button
        ref={btnRef}
        onClick={()=> open ? setOpen(false) : openMenu()}
        title="Categorie"
        style={{background:"transparent",color:activeCats.length>0?"#E8A020":"#8A7D68",padding:6,display:"flex",alignItems:"center"}}
      >
        {activeCats.length>0&&activeCats[0].id==="cat-fav"
          ? <Star size={16} fill="#E8A020" color="#E8A020"/>
          : <Tag size={16}/>
        }
      </button>

      {open && createPortal(
        <div ref={menuRef} onClick={e=>e.stopPropagation()}
          style={{position:"fixed",top:pos.top,left:pos.left,background:"#fff",border:"1px solid #E7DFD3",borderRadius:10,boxShadow:"0 4px 20px rgba(0,0,0,0.18)",width:200,zIndex:1000,overflow:"hidden",maxHeight:"70vh",overflowY:"auto"}}>
          {categories.map(cat => {
            const active = (cardCatIds||[]).includes(cat.id);
            return (
              <button key={cat.id} onClick={()=>onToggle(cardId, cat.id)}
                style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 14px",background:active?"#FAF7F2":"transparent",textAlign:"left",fontSize:14,color:"#2B2521",borderBottom:"1px solid #F0EBE3"}}>
                <span style={{width:10,height:10,borderRadius:"50%",background:cat.color,flexShrink:0}}/>
                <span style={{flex:1}}>{cat.name}</span>
                {active && <Check size={14} color="#B5562B"/>}
              </button>
            );
          })}

          {!creating ? (
            <button onClick={()=>setCreating(true)}
              style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"10px 14px",fontSize:13,color:"#8A7D68",textAlign:"left"}}>
              <Plus size={14}/> Crea nuova categoria
            </button>
          ) : (
            <div style={{padding:"10px 12px",borderTop:"1px solid #F0EBE3"}}>
              <input
                autoFocus
                value={newName}
                onChange={e=>setNewName(e.target.value)}
                onKeyDown={e=>{ if(e.key==="Enter") handleCreate(); if(e.key==="Escape"){setCreating(false);setNewName("");} }}
                placeholder="Nome categoria..."
                style={{width:"100%",padding:"7px 10px",border:"1px solid #DDD3C2",borderRadius:6,fontSize:13,marginBottom:6}}
              />
              <div style={{display:"flex",gap:6}}>
                <button onClick={handleCreate} disabled={!newName.trim()}
                  style={{flex:1,background:"#B5562B",color:"#fff",borderRadius:6,padding:"6px 0",fontSize:13,fontWeight:600,opacity:!newName.trim()?0.5:1}}>
                  Crea
                </button>
                <button onClick={()=>{setCreating(false);setNewName("");}}
                  style={{flex:1,background:"transparent",border:"1px solid #DDD3C2",color:"#5C5246",borderRadius:6,padding:"6px 0",fontSize:13}}>
                  Annulla
                </button>
              </div>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
// Bumped by hand each time this file is rebuilt/deployed — shown under the title so it's easy to
// confirm at a glance whether the code you just pushed to GitHub is actually the version live.
const BUILD_LABEL = "10 set 2026 · 17:42";

export default function VocabApp() {
  const [cards, setCards]           = useState([]);
  const [categories, setCategories] = useState([]);
  const [loaded, setLoaded]         = useState(false);
  const [mode, setMode]             = useState("quiz");

  // scroll-to-top floating button
  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    function onScroll() { setShowScrollTop(window.scrollY > 400); }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // form
  const [formOpen, setFormOpen]         = useState(false);
  const [en, setEn]                 = useState("");
  const [senses, setSenses]         = useState([newSense()]);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestError, setSuggestError] = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const formRef = useRef(null);

  // list UI
  const [listFilter, setListFilter]     = useState("all");
  const [listSearch, setListSearch]     = useState("");
  const [detailCardId, setDetailCardId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [syncing, setSyncing]           = useState(false);
  const [syncMsg, setSyncMsg]           = useState(null);
  const [backupMsg, setBackupMsg]       = useState(null);
  const importInputRef = useRef(null);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput]   = useState(() => getApiKey());
  const [apiKeySaved, setApiKeySaved]   = useState(false);
  const [sheetUrlInput, setSheetUrlInput] = useState(() => getSheetUrl());
  const [sheetUrlSaved, setSheetUrlSaved] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pasteMsg, setPasteMsg] = useState(null);

  // quiz
  const [quizCat, setQuizCat]             = useState("all");
  const [quizDirection, setQuizDirection] = useState("misto");
  const [queue, setQueue]                 = useState([]);
  const [current, setCurrent]             = useState(null);
  const [answer, setAnswer]               = useState("");
  const [feedback, setFeedback]           = useState(null);
  const [stats, setStats]                 = useState({correct:0,total:0});
  const [showDetail, setShowDetail]       = useState(false);
  const inputRef = useRef(null);

  // verbi
  const [verbQueue, setVerbQueue]     = useState([]);
  const [verbCurrent, setVerbCurrent] = useState(null);
  const [verbAnswer, setVerbAnswer]   = useState("");
  const [verbFeedback, setVerbFeedback] = useState(null); // null | "correct" | "wrong" | "revealed"
  const [verbStats, setVerbStats]     = useState({correct:0,total:0});
  const [verbLoading, setVerbLoading] = useState(false);
  const [verbError, setVerbError]     = useState(null); // "noKey" | error message | null
  const verbInputRef = useRef(null);

  // ── load ──
  useEffect(() => {
    (async () => {
      try {
        const [cr, ccr] = await Promise.all([localDb.get(STORAGE_KEY), localDb.get(STORAGE_CATS)]);
        let loadedCards = cr?.value ? JSON.parse(cr.value) : PRELOADED;
        // migration: tag old preloaded-derived cards (numeric id in the seed range, no source yet) as "sheet"
        // so future syncs replace them instead of duplicating, and so they can carry sheet examples.
        loadedCards = loadedCards.map(c =>
          (!c.source && typeof c.id === "number" && c.id >= 1900000000000)
            ? { ...c, source: "sheet", examples: c.examples || [] }
            : c
        );
        // dedupe: if the same word (fuzzy-matched, ignoring -ing/-s/-ed variations) appears more
        // than once (e.g. leftover from an earlier sync, or slightly reworded entries), merge them
        // into a single card instead of showing duplicates.
        const byKey = new Map();
        for (const c of loadedCards) {
          const key = normalizeForMatch(c.en || "");
          const existing = byKey.get(key);
          if (!existing) { byKey.set(key, c); continue; }
          const merged = {
            ...existing,
            categoryIds: Array.from(new Set([...(existing.categoryIds||[]), ...(c.categoryIds||[])])),
            examples: (existing.examples?.length ? existing.examples : c.examples) || [],
            // prefer whichever copy actually has example sentences or richer senses
            senses: (existing.examples?.length || existing.senses?.length >= c.senses?.length) ? existing.senses : c.senses,
            source: existing.source === "sheet" || c.source === "sheet" ? "sheet" : existing.source,
          };
          byKey.set(key, merged);
        }
        loadedCards = Array.from(byKey.values());
        setCards(loadedCards);
        setCategories(ccr?.value ? JSON.parse(ccr.value) : DEFAULT_CATS);
      } catch { setCards(PRELOADED); setCategories(DEFAULT_CATS); }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => { if(loaded) localDb.set(STORAGE_KEY, JSON.stringify(cards)).catch(()=>{}); }, [cards, loaded]);
  useEffect(() => { if(loaded) localDb.set(STORAGE_CATS, JSON.stringify(categories)).catch(()=>{}); }, [categories, loaded]);

  useEffect(() => {
    if (mode==="quiz"&&cards.length>0&&!current&&queue.length===0) startSession();
  }, [mode, cards.length]);

  useEffect(() => {
    if (mode==="verbi"&&!verbCurrent&&verbQueue.length===0&&!verbLoading&&!verbError) startVerbSession();
  }, [mode]);

  // ── category helpers ──
  function toggleCardCategory(cardId, catId) {
    setCards(cs => cs.map(c => {
      if (c.id !== cardId) return c;
      const ids = c.categoryIds || [];
      return { ...c, categoryIds: ids.includes(catId) ? ids.filter(x=>x!==catId) : [...ids, catId] };
    }));
  }

  function createCategoryAndAssign(cardId, name) {
    const color = PALETTE[categories.length % PALETTE.length];
    const cat = { id: uid(), name, color };
    setCategories(cs => [...cs, cat]);
    setCards(cs => cs.map(c => c.id===cardId ? { ...c, categoryIds:[...(c.categoryIds||[]), cat.id] } : c));
  }

  // ── quiz helpers ──
  function filteredCards(catId) {
    if (catId==="all") return cards;
    return cards.filter(c => (c.categoryIds||[]).includes(catId));
  }

  function makePrompt(card, dir) {
    const side = dir==="en-it"?"en" : dir==="it-en"?"it" : Math.random()<0.5?"en":"it";
    if (side==="en") return {card,side,prompt:card.en,sense:null};
    const valid = card.senses.filter(s=>s.translations.length>0);
    const sense = valid[Math.floor(Math.random()*valid.length)];
    const word  = sense.translations[Math.floor(Math.random()*sense.translations.length)];
    return {card,side,prompt:word,sense};
  }

  function startSession(dir, cat) {
    const d=dir??quizDirection, c=cat??quizCat;
    const pool = filteredCards(c);
    if (!pool.length) { setCurrent(null); setQueue([]); return; }
    const q = [...pool].sort(()=>Math.random()-0.5).map(card=>makePrompt(card,d));
    setCurrent(q[0]); setQueue(q.slice(1));
    setStats({correct:0,total:0}); setFeedback(null); setAnswer(""); setShowDetail(false);
  }

  function nextCard() {
    let q = queue;
    if (!q.length) q = filteredCards(quizCat).sort(()=>Math.random()-0.5).map(c=>makePrompt(c,quizDirection));
    setCurrent(q[0]); setQueue(q.slice(1));
    setAnswer(""); setFeedback(null); setShowDetail(false);
    setTimeout(()=>inputRef.current?.focus(),50);
  }

  function normalize(s) { return s.trim().toLowerCase().replace(/[.,!?;:]/g,""); }

  function checkAnswer() {
    if (!current) return;
    const {card,side} = current;
    const isCorrect = side==="en"
      ? card.senses.flatMap(s=>s.translations).some(t=>normalize(t)===normalize(answer))
      : normalize(card.en)===normalize(answer);
    setFeedback(isCorrect?"correct":"wrong");
    setStats(s=>({correct:s.correct+(isCorrect?1:0),total:s.total+1}));
    setShowDetail(true);
  }

  function handleKey(e) {
    if (e.key!=="Enter") return;
    if (feedback===null) checkAnswer(); else nextCard();
  }

  // ── verbi helpers ──
  async function startVerbSession() {
    if (!getApiKey()) { setVerbError("noKey"); return; }
    setVerbLoading(true); setVerbError(null);
    try {
      const batch = await fetchVerbBatch();
      setVerbCurrent(batch[0]); setVerbQueue(batch.slice(1));
      setVerbStats({correct:0,total:0}); setVerbFeedback(null); setVerbAnswer("");
    } catch (e) { setVerbError(e.message || String(e)); }
    setVerbLoading(false);
  }

  async function nextVerbCard() {
    setVerbAnswer(""); setVerbFeedback(null);
    if (verbQueue.length) {
      setVerbCurrent(verbQueue[0]); setVerbQueue(q=>q.slice(1));
      setTimeout(()=>verbInputRef.current?.focus(),50);
      return;
    }
    if (!getApiKey()) { setVerbError("noKey"); setVerbCurrent(null); return; }
    setVerbLoading(true); setVerbError(null);
    try {
      const batch = await fetchVerbBatch();
      setVerbCurrent(batch[0]); setVerbQueue(batch.slice(1));
    } catch (e) { setVerbError(e.message || String(e)); setVerbCurrent(null); }
    setVerbLoading(false);
  }

  function normalizeVerb(s) { return s.trim().toLowerCase().replace(/[.,!?;:]/g,""); }

  function checkVerbAnswer() {
    if (!verbCurrent || verbCurrent.type!=="blank") return;
    const isCorrect = normalizeVerb(verbAnswer)===normalizeVerb(verbCurrent.answer);
    setVerbFeedback(isCorrect?"correct":"wrong");
    setVerbStats(s=>({correct:s.correct+(isCorrect?1:0),total:s.total+1}));
  }

  function revealTranslation() { setVerbFeedback("revealed"); }

  function selfReportTranslation(correct) {
    setVerbStats(s=>({correct:s.correct+(correct?1:0),total:s.total+1}));
    nextVerbCard();
  }

  function handleVerbKey(e) {
    if (e.key!=="Enter" || !verbCurrent || verbCurrent.type!=="blank") return;
    if (verbFeedback===null) checkVerbAnswer(); else nextVerbCard();
  }

  // ── form helpers ──
  function updateSense(id,patch){ setSenses(s=>s.map(x=>x.id===id?{...x,...patch}:x)); }
  function addSenseRow()        { setSenses(s=>[...s,newSense()]); }
  function removeSenseRow(id)   { setSenses(s=>s.length>1?s.filter(x=>x.id!==id):s); }

  async function suggestTranslations() {
    if (!en.trim()) return;
    setSuggesting(true); setSuggestError(false);
    try {
      const text = await callGemini(`For the English word or idiom "${en.trim()}", list its common Italian translations grouped by part of speech. Reply ONLY with valid JSON, no markdown, format: [{"pos":"sostantivo","translations":["t1","t2"]}]. Labels: sostantivo, verbo, aggettivo, avverbio, "modo di dire", altro. Max 4 senses, 4 translations each.`);
      const raw = text.trim().replace(/^```json\s*|^```\s*|```$/g,"");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)&&parsed.length>0)
        setSenses(parsed.map(p=>({id:Math.random().toString(36).slice(2),pos:POS_OPTIONS.includes(p.pos)?p.pos:"altro",text:(p.translations||[]).join(", ")})));
      else setSuggestError(true);
    } catch { setSuggestError(true); }
    setSuggesting(false);
  }

  async function extractVocabFromCsvChunk(csvChunk) {
    const raw = await callGemini(`Below is a raw chunk of CSV rows exported from a Google Sheets vocabulary list ("Eng" tab). Each row generally pairs an English word/phrase with an Italian translation in adjacent columns, and the translation cell often contains one or more example sentences in parentheses. The chunk may also contain empty rows, ALL-CAPS section headers, or the occasional unrelated row — skip those, and skip any row where the "word" is just a number.

CSV chunk:
"""
${csvChunk}
"""

For every genuine vocabulary entry, extract: the English term, its Italian translation(s), the part of speech, and any example sentences already written in parentheses in the translation cell (extract them VERBATIM as {"en":"...","it":"..."} pairs; leave "it" empty if no Italian version is given; never invent or translate examples yourself — only extract what is literally written, and if there's no example leave the array empty).

Return ONLY a valid JSON array, no markdown, no explanation: [{"en":"word","it":"italian translation","pos":"modo di dire","examples":[{"en":"...","it":"..."}]},...]. Use only these pos values: sostantivo, verbo, aggettivo, avverbio, "modo di dire", preposizione, pronome, altro.`, 8000);
    const clean = raw.trim().replace(/^```json\s*|^```\s*|```$/gm, "").trim();
    const match = clean.match(/\[[\s\S]*\]/);
    if (!match) return [];
    try { return JSON.parse(match[0]); } catch { return []; }
  }

  async function syncFromSheet() {
    const sheetUrl = getSheetUrl();
    if (!sheetUrl) {
      setSyncMsg("✗ Aggiungi prima il link CSV del foglio nelle Impostazioni ⚙️.");
      return;
    }
    if (!getApiKey()) {
      setSyncMsg("✗ Aggiungi prima la tua chiave API Gemini (gratuita) nelle Impostazioni ⚙️.");
      return;
    }
    setSyncing(true);
    setSyncMsg("Scarico il foglio...");
    try {
      const csvRes = await fetch(sheetUrl);
      if (!csvRes.ok) throw new Error("csv fetch failed");
      const csvText = await csvRes.text();
      const records = splitCsvIntoRecords(csvText).filter(r => r.trim());
      const chunks = chunkCsvRecords(records, 150);

      let sheetEntries = [];
      const seen = new Set();
      for (let i = 0; i < chunks.length; i++) {
        setSyncMsg(`Sincronizzazione: blocco ${i + 1}/${chunks.length}...`);
        const batch = await extractVocabFromCsvChunk(chunks[i]);
        const fresh = batch.filter(e => e && e.en && e.it && !seen.has(normalizeForMatch(e.en)));
        fresh.forEach(e => seen.add(normalizeForMatch(e.en)));
        sheetEntries = sheetEntries.concat(fresh);
      }
      if (sheetEntries.length === 0) throw new Error("Nessuna voce trovata");

      setCards(prev => {
        const existingKeys = new Set(prev.map(c => normalizeForMatch(c.en)));
        const buildCard = (entry, old) => {
          const examples = Array.isArray(entry.examples)
            ? entry.examples.filter(ex => ex && ex.en && ex.en.trim()).map(ex => ({ en: ex.en.trim(), it: (ex.it||"").trim() }))
            : [];
          return {
            id: old?.id ?? (1900000000000 + Date.now() + Math.random()),
            en: entry.en,
            senses: [{ pos: POS_OPTIONS.includes(entry.pos) ? entry.pos : "altro", translations: entry.it.split(",").map(t => t.trim()).filter(Boolean) }],
            categoryIds: old?.categoryIds ?? [],
            examples,
            source: "sheet"
          };
        };
        const merged = mergeCardsFullReorder(prev, sheetEntries, buildCard);
        const added = sheetEntries.filter(e => !existingKeys.has(normalizeForMatch(e.en))).length;
        const updated = sheetEntries.length - added;
        setSyncMsg(`✓ ${sheetEntries.length} voci dal foglio (${chunks.length} blocchi): ${added} nuove, ${updated} aggiornate, ordine del foglio riapplicato a tutta la lista.`);
        return merged;
      });
    } catch (e) {
      setSyncMsg(e.message === "csv fetch failed"
        ? "✗ Impossibile leggere il foglio. Controlla che il link CSV sia corretto e pubblicato."
        : `✗ Errore durante la sincronizzazione: ${e.message || e}`);
    }
    setSyncing(false);
  }

  // Parses rows copied straight from Google Sheets (tab-separated columns) — no API key needed.
  function parsePastedRows(raw) {
    const lines = raw.split(/\r\n|\n/).map(l => l).filter(l => l.trim());
    const parsed = [];
    for (const line of lines) {
      const cols = line.split("\t").map(c => c.trim());
      const nonEmpty = cols.filter(c => c.length > 0);
      if (nonEmpty.length < 2) continue;
      const [enRaw, itRaw] = nonEmpty;
      if (!enRaw || !itRaw) continue;
      // skip obvious ALL-CAPS section headers (no lowercase letters, short-ish)
      if (!/[a-z]/.test(enRaw) && /[A-Z]/.test(enRaw)) continue;
      // extract example sentences already written in parentheses, keep the rest as translations
      const examples = [];
      let itClean = itRaw;
      const parenMatches = itRaw.match(/\(([^)]+)\)/g) || [];
      parenMatches.forEach(m => {
        const inner = m.slice(1, -1).trim();
        if (inner.length > 15 && /[a-zA-Z]/.test(inner) && /\s/.test(inner)) {
          examples.push({ en: inner, it: "" });
          itClean = itClean.replace(m, "").trim();
        }
      });
      const translations = itClean.split(",").map(t => t.trim()).filter(Boolean);
      if (translations.length === 0) continue;
      parsed.push({ en: enRaw, it: translations.join(", "), pos: "altro", examples });
    }
    return parsed;
  }

  function importPastedWords() {
    const entries = parsePastedRows(pasteText);
    if (entries.length === 0) {
      setPasteMsg("✗ Nessuna riga riconosciuta. Copia le colonne inglese e italiano dal foglio (due colonne separate da tabulazione).");
      return;
    }
    setCards(prev => {
      const existingKeys = new Set(prev.map(c => normalizeForMatch(c.en)));
      const buildCard = (entry, old) => ({
        id: old?.id ?? (1900000000000 + Date.now() + Math.random()),
        en: entry.en,
        senses: [{ pos: "altro", translations: entry.it.split(",").map(t => t.trim()).filter(Boolean) }],
        categoryIds: old?.categoryIds ?? [],
        examples: entry.examples.length ? entry.examples : (old?.examples || []),
        source: old?.source || "sheet"
      });
      const merged = mergeCardsPreservingOrder(prev, entries, buildCard);
      const added = entries.filter(e => !existingKeys.has(normalizeForMatch(e.en))).length;
      setPasteMsg(`✓ ${entries.length} parole importate (${added} nuove, ${entries.length - added} aggiornate), posizionate secondo l'ordine del foglio.`);
      return merged;
    });
    setPasteText("");
  }

  function exportBackup() {
    const payload = { cards, categories, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vocab-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setBackupMsg("✓ Backup scaricato.");
  }

  function importBackup(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!Array.isArray(parsed.cards)) throw new Error("formato non valido");
        setCards(parsed.cards);
        setCategories(Array.isArray(parsed.categories) ? parsed.categories : DEFAULT_CATS);
        await localDb.set(STORAGE_KEY, JSON.stringify(parsed.cards));
        await localDb.set(STORAGE_CATS, JSON.stringify(Array.isArray(parsed.categories) ? parsed.categories : DEFAULT_CATS));
        setBackupMsg(`✓ Backup importato: ${parsed.cards.length} parole ripristinate.`);
      } catch {
        setBackupMsg("✗ File di backup non valido.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function addCard() {
    if (!en.trim()) return;
    const builtSenses = senses.map(s=>({pos:s.pos,translations:s.text.split(",").map(t=>t.trim()).filter(Boolean)})).filter(s=>s.translations.length>0);
    if (!builtSenses.length) return;
    if (editingId) setCards(c=>c.map(card=>card.id===editingId?{...card,en:en.trim(),senses:builtSenses}:card));
    else setCards(c=>[...c,{id:Date.now(),en:en.trim(),senses:builtSenses,categoryIds:[]}]);
    resetForm();
  }

  function resetForm(){ setEn(""); setSenses([newSense()]); setSuggestError(false); setEditingId(null); setFormOpen(false); }

  function startEdit(card) {
    setEditingId(card.id);
    setEn(card.en);
    setSenses(card.senses.map(s=>({id:Math.random().toString(36).slice(2),pos:s.pos,text:s.translations.join(", ")})));
    setSuggestError(false); setDetailCardId(null);
    setFormOpen(true);
    setTimeout(()=>formRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),50);
  }

  function doDelete(id) {
    setCards(c=>c.filter(card=>card.id!==id));
    if (editingId===id) resetForm();
    if (detailCardId===id) setDetailCardId(null);
    setConfirmDelete(null);
  }

  const quizPool   = filteredCards(quizCat);
  const listCards  = filteredCards(listFilter).filter(c => {
    if (!listSearch.trim()) return true;
    const q = listSearch.toLowerCase();
    return c.en.toLowerCase().includes(q) ||
      c.senses.some(s => s.translations.some(t => t.toLowerCase().includes(q)));
  });
  const detailCard = detailCardId ? cards.find(c=>c.id===detailCardId) : null;
  // re-derived from `cards` (not the frozen snapshot in `current`) so category toggles made
  // mid-quiz are reflected immediately in the dropdown.
  const currentCard = current ? (cards.find(c=>c.id===current.card.id) || current.card) : null;
  const correctAns = current?(current.side==="en"?current.card.senses.flatMap(s=>s.translations).join(" / "):current.card.en):null;
  const promptLabel= current?(current.side==="en"?"EN → IT":`IT${current.sense&&current.sense.pos!=="altro"?` (${POS_LABEL[current.sense.pos]})`:"" } → EN`):null;

  return (
    <div style={{minHeight:"100vh",background:"#FAF7F2",fontFamily:"'Source Sans 3','Segoe UI',sans-serif",color:"#2B2521",padding:"32px 16px"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Source+Sans+3:wght@400;600;700&display=swap');
        *{font-family:'Source Sans 3',sans-serif;box-sizing:border-box;}
        .display{font-family:'Fraunces',serif;}
        button{cursor:pointer;border:none;font-family:inherit;}
        button:disabled{cursor:not-allowed;}
        input,select{font-family:inherit;}
        button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid #B5562B;outline-offset:2px;}
        .spin{animation:spin 0.8s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg);}}
      `}</style>

      {confirmDelete && <ConfirmModal word={confirmDelete.en} onConfirm={()=>doDelete(confirmDelete.id)} onCancel={()=>setConfirmDelete(null)}/>}

      <div style={{maxWidth:620,margin:"0 auto"}}>
        {/* HEADER */}
        <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:10}}>
          <div>
            <h1 className="display" style={{fontSize:30,fontWeight:700,margin:0,color:"#1F1A16"}}>Lexico</h1>
            <div style={{fontSize:11,color:"#B5A88F",marginTop:2}}>Build: {BUILD_LABEL}</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <TabButton active={mode==="quiz"} onClick={()=>setMode("quiz")}>Esercitati</TabButton>
            <TabButton active={mode==="verbi"} onClick={()=>setMode("verbi")}>Verbi</TabButton>
            <TabButton active={mode==="list"} onClick={()=>setMode("list")}>Parole ({cards.length})</TabButton>
            <button onClick={()=>setShowSettings(s=>!s)} title="Impostazioni"
              style={{display:"flex",alignItems:"center",justifyContent:"center",width:36,height:36,background:showSettings?"#1F1A16":"transparent",color:showSettings?"#FAF7F2":"#8A7D68",border:"1px solid #DDD3C2",borderRadius:8}}>
              <Settings size={16}/>
            </button>
          </div>
        </header>

        {showSettings && (
          <div style={{background:"#fff",border:"1px solid #EFE8DC",borderRadius:10,padding:"16px 18px",marginBottom:20}}>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:1,color:"#9C8F7A",marginBottom:8}}>CHIAVE API GOOGLE GEMINI (GRATUITA)</div>
            <div style={{fontSize:13,color:"#7A6E63",marginBottom:10,lineHeight:1.5}}>
              Facoltativa — serve solo se vuoi generare traduzioni/esempi o sincronizzare da qui. Per studiare e fare i quiz non serve. Resta salvata solo su questo dispositivo, non viene mai inviata altrove.
              Gratuita, nessuna carta richiesta: vai su <span style={{fontWeight:600}}>aistudio.google.com</span> → "Get API key" → crea una nuova chiave.
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <input
                type="password"
                value={apiKeyInput}
                onChange={e=>{ setApiKeyInput(e.target.value); setApiKeySaved(false); }}
                placeholder="AIza..."
                style={{flex:1,minWidth:180,background:"#FAF7F2",border:"1px solid #DDD3C2",borderRadius:7,padding:"9px 12px",fontSize:13}}
              />
              <button
                onClick={()=>{ setApiKey(apiKeyInput.trim()); setApiKeySaved(true); }}
                style={{background:"#B5562B",color:"#fff",borderRadius:7,padding:"9px 16px",fontWeight:600,fontSize:13}}>
                Salva
              </button>
            </div>
            {apiKeySaved && <div style={{fontSize:12,color:"#4A7A4A",fontWeight:600,marginTop:8}}>✓ Chiave salvata.</div>}

            <div style={{height:1,background:"#EFE8DC",margin:"16px 0"}}/>

            <div style={{fontSize:11,fontWeight:700,letterSpacing:1,color:"#9C8F7A",marginBottom:8}}>FOGLIO ENG (SCHEDA "ENG")</div>
            <div style={{fontSize:13,color:"#7A6E63",marginBottom:10,lineHeight:1.5}}>
              Nel foglio Google: File → Condividi → Pubblica sul web → scegli la scheda "Eng" → formato CSV → Pubblica, poi incolla qui il link generato.
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <input
                type="text"
                value={sheetUrlInput}
                onChange={e=>{ setSheetUrlInput(e.target.value); setSheetUrlSaved(false); }}
                placeholder="https://docs.google.com/spreadsheets/d/e/.../pub?output=csv"
                style={{flex:1,minWidth:180,background:"#FAF7F2",border:"1px solid #DDD3C2",borderRadius:7,padding:"9px 12px",fontSize:13}}
              />
              <button
                onClick={()=>{ setSheetUrl(sheetUrlInput.trim()); setSheetUrlSaved(true); }}
                style={{background:"#B5562B",color:"#fff",borderRadius:7,padding:"9px 16px",fontWeight:600,fontSize:13}}>
                Salva
              </button>
            </div>
            {sheetUrlSaved && <div style={{fontSize:12,color:"#4A7A4A",fontWeight:600,marginTop:8}}>✓ Link salvato.</div>}
          </div>
        )}

        {/* ══ LIST MODE ══════════════════════════════════════════════ */}
        {mode==="list" && (
          <div>
            {/* toggle button */}
            <button
              onClick={()=>{ setFormOpen(o=>!o); if(editingId) resetForm(); }}
              style={{display:"flex",alignItems:"center",gap:8,width:"100%",background:formOpen?"#1F1A16":"#fff",color:formOpen?"#FAF7F2":"#2B2521",border:"1px solid",borderColor:formOpen?"#1F1A16":"#DDD3C2",borderRadius:9,padding:"11px 16px",fontWeight:600,fontSize:14,marginBottom:formOpen?0:16,borderBottomLeftRadius:formOpen?0:9,borderBottomRightRadius:formOpen?0:9}}>
              <Plus size={16} style={{transform:formOpen?"rotate(45deg)":"none",transition:"transform 0.2s"}}/>
              {editingId ? "Modifica parola" : formOpen ? "Chiudi" : "Aggiungi parola"}
            </button>

            {/* collapsible form */}
            {formOpen && (
            <div ref={formRef} style={{background:"#fff",border:"1px solid #DDD3C2",borderTop:"none",borderRadius:"0 0 9px 9px",padding:16,marginBottom:20}}>
              {editingId&&<div style={{fontSize:12,color:"#B5562B",fontWeight:700,letterSpacing:0.3,marginBottom:10}}>MODIFICA PAROLA</div>}
              <div style={{display:"flex",gap:8,marginBottom:12}}>
                <input value={en} onChange={e=>{setEn(e.target.value);setSuggestError(false);}} placeholder="parola o modo di dire in inglese"
                  style={{flex:1,padding:"10px 12px",border:"1px solid #DDD3C2",borderRadius:7,fontSize:15}}/>
                <button onClick={suggestTranslations} disabled={!en.trim()||suggesting}
                  style={{background:"#fff",color:"#B5562B",border:"1px solid #E7CBB8",borderRadius:7,padding:"10px 14px",display:"flex",alignItems:"center",gap:6,fontWeight:600,fontSize:14,opacity:!en.trim()||suggesting?0.5:1,whiteSpace:"nowrap"}}>
                  {suggesting?<Loader2 size={16} className="spin"/>:<Sparkles size={16}/>} Suggerisci
                </button>
              </div>
              <div style={{fontSize:12,color:"#9C8F7A",marginBottom:10,letterSpacing:0.3}}>TRADUZIONI PER CATEGORIA GRAMMATICALE</div>
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
                {senses.map(sense=>(
                  <div key={sense.id} style={{display:"flex",gap:8}}>
                    <select value={sense.pos} onChange={e=>updateSense(sense.id,{pos:e.target.value})}
                      style={{padding:"10px 8px",border:"1px solid #DDD3C2",borderRadius:7,fontSize:14,background:"#fff",flex:"0 0 130px"}}>
                      {POS_OPTIONS.map(p=><option key={p} value={p}>{p}</option>)}
                    </select>
                    <input value={sense.text} onChange={e=>updateSense(sense.id,{text:e.target.value})} placeholder="sinonimi separati da virgola"
                      style={{flex:1,padding:"10px 12px",border:"1px solid #DDD3C2",borderRadius:7,fontSize:15}}/>
                    <button onClick={()=>removeSenseRow(sense.id)} disabled={senses.length===1}
                      style={{background:"transparent",color:"#B5562B",padding:6,opacity:senses.length===1?0.3:1}}><XCircle size={18}/></button>
                  </div>
                ))}
                <button onClick={addSenseRow} style={{background:"transparent",color:"#8A7D68",fontSize:13,display:"flex",alignItems:"center",gap:4,alignSelf:"flex-start"}}>
                  <Plus size={14}/> aggiungi un altro significato
                </button>
              </div>
              <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
                {editingId&&<button onClick={resetForm} style={{background:"transparent",color:"#8A7D68",border:"1px solid #DDD3C2",borderRadius:7,padding:"10px 16px",fontSize:14,fontWeight:600}}>Annulla</button>}
                <button onClick={addCard} disabled={!en.trim()||senses.every(s=>!s.text.trim())}
                  style={{background:"#B5562B",color:"#fff",borderRadius:7,padding:"10px 18px",display:"flex",alignItems:"center",gap:6,fontWeight:600,fontSize:14,opacity:!en.trim()||senses.every(s=>!s.text.trim())?0.5:1}}>
                  {editingId?<><Check size={16}/>Salva modifiche</>:<><Plus size={16}/>Aggiungi parola</>}
                </button>
              </div>
              {suggestError&&<div style={{marginTop:10,fontSize:13,color:"#B5562B"}}>Suggerimento non disponibile. Inserisci manualmente.</div>}
            </div>
            )}

            {/* sync button */}
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6,flexWrap:"wrap"}}>
              <button
                onClick={syncFromSheet}
                disabled={syncing}
                style={{display:"flex",alignItems:"center",gap:7,background:syncing?"#E7DFD3":"#1F1A16",color:syncing?"#8A7D68":"#FAF7F2",border:"none",borderRadius:8,padding:"9px 16px",fontWeight:600,fontSize:13,opacity:syncing?0.7:1}}
              >
                {syncing
                  ? <><Loader2 size={14} className="spin"/> Sincronizzazione in corso...</>
                  : <><RefreshCw size={14}/> Aggiorna da foglio ENG</>
                }
              </button>
              {syncMsg && (
                <span style={{fontSize:12,color:syncMsg.startsWith("✓")?"#4A7A4A":"#B5562B",fontWeight:600}}>
                  {syncMsg}
                </span>
              )}
            </div>

            {/* paste-from-sheet import — no API key needed, works fully offline */}
            <div style={{marginBottom:14}}>
              <button
                onClick={()=>setPasteOpen(o=>!o)}
                style={{display:"flex",alignItems:"center",gap:7,background:"transparent",color:"#8A7D68",border:"1px solid #DDD3C2",borderRadius:8,padding:"9px 16px",fontWeight:600,fontSize:13}}>
                <Plus size={14} style={{transform:pasteOpen?"rotate(45deg)":"none",transition:"transform 0.2s"}}/> Incolla parole dal foglio
              </button>
              {pasteOpen && (
                <div style={{background:"#fff",border:"1px solid #EFE8DC",borderRadius:9,padding:14,marginTop:8}}>
                  <div style={{fontSize:13,color:"#7A6E63",marginBottom:8,lineHeight:1.5}}>
                    Nel foglio Google, seleziona le celle delle colonne <b>Inglese</b> e <b>Italiano</b> (senza il numero di riga), copiale, poi incollale qui sotto.
                  </div>
                  <textarea
                    value={pasteText}
                    onChange={e=>{setPasteText(e.target.value); setPasteMsg(null);}}
                    placeholder={"Further\tpiù lontano, ulteriormente\nCatch up\tbeccarsi con qualcuno, rivedersi"}
                    rows={5}
                    style={{width:"100%",padding:"10px 12px",border:"1px solid #DDD3C2",borderRadius:7,fontSize:13,fontFamily:"monospace",resize:"vertical"}}
                  />
                  <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}>
                    <button onClick={importPastedWords} disabled={!pasteText.trim()}
                      style={{background:"#B5562B",color:"#fff",borderRadius:7,padding:"9px 18px",fontWeight:600,fontSize:13,opacity:!pasteText.trim()?0.5:1}}>
                      Importa parole incollate
                    </button>
                  </div>
                  {pasteMsg && (
                    <div style={{fontSize:12,color:pasteMsg.startsWith("✓")?"#4A7A4A":"#B5562B",fontWeight:600,marginTop:8}}>
                      {pasteMsg}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,flexWrap:"wrap"}}>
              <button
                onClick={exportBackup}
                style={{display:"flex",alignItems:"center",gap:7,background:"transparent",color:"#8A7D68",border:"1px solid #DDD3C2",borderRadius:8,padding:"8px 14px",fontWeight:600,fontSize:13}}
              >
                <Download size={14}/> Esporta backup
              </button>
              <button
                onClick={()=>importInputRef.current?.click()}
                style={{display:"flex",alignItems:"center",gap:7,background:"transparent",color:"#8A7D68",border:"1px solid #DDD3C2",borderRadius:8,padding:"8px 14px",fontWeight:600,fontSize:13}}
              >
                <Upload size={14}/> Importa backup
              </button>
              <input ref={importInputRef} type="file" accept="application/json" onChange={importBackup} style={{display:"none"}}/>
              {backupMsg && (
                <span style={{fontSize:12,color:backupMsg.startsWith("✓")?"#4A7A4A":"#B5562B",fontWeight:600}}>
                  {backupMsg}
                </span>
              )}
            </div>

            {/* search bar */}
            <div style={{position:"relative",marginBottom:12}}>
              <input
                value={listSearch}
                onChange={e=>setListSearch(e.target.value)}
                placeholder="Cerca parola o traduzione..."
                style={{width:"100%",padding:"10px 36px 10px 14px",border:"1px solid #DDD3C2",borderRadius:8,fontSize:15,background:"#fff"}}
              />
              {listSearch && (
                <button onClick={()=>setListSearch("")}
                  style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"transparent",color:"#9C8F7A",padding:2,display:"flex"}}>
                  <X size={16}/>
                </button>
              )}
            </div>

            {/* filter bar */}
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
              <FilterPill active={listFilter==="all"} onClick={()=>setListFilter("all")}>Tutte ({cards.length})</FilterPill>
              {categories.map(cat=>{
                const count = cards.filter(c=>(c.categoryIds||[]).includes(cat.id)).length;
                return <FilterPill key={cat.id} active={listFilter===cat.id} color={cat.color} onClick={()=>setListFilter(cat.id)}>{cat.id==="cat-fav"&&<Star size={11} style={{marginRight:3}}/>}{cat.name} ({count})</FilterPill>;
              })}
            </div>

            {listCards.length===0 ? (
              listSearch || listFilter!=="all"
                ? <div style={{textAlign:"center",padding:"40px 20px",color:"#9C8F7A",border:"1px dashed #DDD3C2",borderRadius:12,fontSize:15}}>
                    Nessun risultato{listSearch ? ` per "${listSearch}"` : ""}.
                  </div>
                : <EmptyState/>
            ) : (
              <ul style={{listStyle:"none",padding:0,margin:0,display:"flex",flexDirection:"column",gap:8}}>
                {listCards.map(c=>(
                  <li key={c.id} style={{background:c.id===editingId?"#FBF0EC":"#fff",border:c.id===editingId?"1px solid #E7CBB8":"1px solid #EFE8DC",borderRadius:8}}>
                    <div onClick={()=>setDetailCardId(detailCardId===c.id?null:c.id)}
                      style={{padding:"12px 14px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:15,marginBottom:2}}>{c.en}</div>
                        {c.senses.map((s,i)=>(
                          <div key={i} style={{fontSize:13,color:"#5C5246",display:"flex",gap:6}}>
                            {s.pos!=="altro"&&<span style={{color:"#B5562B",fontStyle:"italic"}}>{POS_LABEL[s.pos]||s.pos}</span>}
                            <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.translations.join(", ")}</span>
                          </div>
                        ))}
                        {/* category badges */}
                        {(c.categoryIds||[]).length>0&&(
                          <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:5}}>
                            {(c.categoryIds||[]).map(id=>{
                              const cat=categories.find(x=>x.id===id);
                              return cat?(
                                <span key={id} style={{background:cat.color+"22",color:cat.color,border:`1px solid ${cat.color}44`,borderRadius:20,padding:"1px 8px",fontSize:11,fontWeight:600,display:"inline-flex",alignItems:"center",gap:3}}>
                                  {cat.id==="cat-fav"&&<Star size={9} fill={cat.color}/>}{cat.name}
                                </span>
                              ):null;
                            })}
                          </div>
                        )}
                      </div>
                      {/* action buttons */}
                      <div style={{display:"flex",gap:2,marginLeft:8,flexShrink:0,alignItems:"center"}} onClick={e=>e.stopPropagation()}>
                        <CategoryDropdown
                          cardId={c.id}
                          cardCatIds={c.categoryIds||[]}
                          categories={categories}
                          onToggle={toggleCardCategory}
                          onCreateCategory={createCategoryAndAssign}
                        />
                        <button onClick={()=>startEdit(c)} style={{background:"transparent",color:"#8A7D68",padding:6}}><Pencil size={16}/></button>
                        <button onClick={()=>setConfirmDelete(c)} style={{background:"transparent",color:"#B5562B",padding:6}}><Trash2 size={16}/></button>
                      </div>
                    </div>
                    {detailCardId===c.id&&(
                      <div style={{borderTop:"1px solid #EFE8DC",padding:"0 14px 14px"}}>
                        <WordDetail card={c} onClose={()=>setDetailCardId(null)}/>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* ══ QUIZ MODE ══════════════════════════════════════════════ */}
        {mode==="quiz"&&(
          <div>
            {cards.length===0 ? <EmptyState/> : (
              <div>
                {/* category filter */}
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:11,color:"#9C8F7A",fontWeight:700,letterSpacing:1,marginBottom:8}}>CATEGORIA</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    <FilterPill active={quizCat==="all"} onClick={()=>{setQuizCat("all");startSession(undefined,"all");}}>Tutte ({cards.length})</FilterPill>
                    {categories.map(cat=>{
                      const count=filteredCards(cat.id).length;
                      if(!count) return null;
                      return (
                        <FilterPill key={cat.id} active={quizCat===cat.id} color={cat.color} onClick={()=>{setQuizCat(cat.id);startSession(undefined,cat.id);}}>
                          {cat.id==="cat-fav"&&<Star size={11} style={{marginRight:3}}/>}{cat.name} ({count})
                        </FilterPill>
                      );
                    })}
                  </div>
                </div>

                {/* direction */}
                <div style={{display:"flex",gap:6,marginBottom:14,justifyContent:"center"}}>
                  {[{key:"en-it",label:"EN → IT"},{key:"it-en",label:"IT → EN"},{key:"misto",label:"🔀 Misto"}].map(({key,label})=>(
                    <button key={key} onClick={()=>{setQuizDirection(key);startSession(key,quizCat);}}
                      style={{padding:"7px 14px",borderRadius:20,fontSize:13,fontWeight:600,border:quizDirection===key?"none":"1px solid #DDD3C2",background:quizDirection===key?"#1F1A16":"transparent",color:quizDirection===key?"#FAF7F2":"#5C5246"}}>
                      {label}
                    </button>
                  ))}
                </div>

                {quizPool.length===0 ? (
                  <div style={{textAlign:"center",padding:"40px 20px",color:"#9C8F7A",border:"1px dashed #DDD3C2",borderRadius:12}}>
                    Nessuna parola in questa categoria. Aggiungile dalla scheda "Parole".
                  </div>
                ) : current ? (
                  <>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:13,color:"#8A7D68",marginBottom:10}}>
                      <span>Punteggio: {stats.correct}/{stats.total}</span>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <CategoryDropdown
                          cardId={currentCard.id}
                          cardCatIds={currentCard.categoryIds||[]}
                          categories={categories}
                          onToggle={toggleCardCategory}
                          onCreateCategory={createCategoryAndAssign}
                        />
                        <button onClick={()=>startSession()} style={{background:"transparent",color:"#8A7D68",display:"flex",gap:4,alignItems:"center",fontSize:13}}>
                          <Shuffle size={14}/> Rimescola
                        </button>
                      </div>
                    </div>
                    <div style={{background:"#fff",border:"1px solid #E7DFD3",borderRadius:14,padding:"32px 24px",textAlign:"center"}}>
                      <div style={{fontSize:12,letterSpacing:1.5,color:"#B5562B",fontWeight:700,marginBottom:10}}>{promptLabel}</div>
                      <div className="display" style={{fontSize:34,fontWeight:600,marginBottom:20}}>{current.prompt}</div>
                      <div style={{marginBottom:20}}>
                        {feedback===null
                          ?<ActionButton onClick={checkAnswer} color="#B5562B">Verifica</ActionButton>
                          :<ActionButton onClick={nextCard} color={feedback==="correct"?"#4A7A4A":"#B5562B"}>
                            {feedback==="correct"?<><Check size={16} style={{marginRight:6}}/>Continua</>:<><X size={16} style={{marginRight:6}}/>Continua</>}
                          </ActionButton>
                        }
                      </div>
                      <input ref={inputRef} value={answer} onChange={e=>setAnswer(e.target.value)} onKeyDown={handleKey}
                        disabled={feedback!==null} autoFocus placeholder="la tua traduzione"
                        style={{width:"100%",maxWidth:320,padding:"12px 14px",borderRadius:8,fontSize:17,textAlign:"center",
                          border:feedback==="correct"?"2px solid #4A7A4A":feedback==="wrong"?"2px solid #B5562B":"1px solid #DDD3C2",
                          background:feedback==="correct"?"#F1F7EF":feedback==="wrong"?"#FBF0EC":"#fff"}}/>
                      {showDetail&&feedback!==null&&(
                        <WordDetail card={current.card}
                          feedbackBadge={
                            <div style={{display:"inline-flex",alignItems:"center",gap:6,background:feedback==="correct"?"#EAF4E8":"#FDEEE8",color:feedback==="correct"?"#3A6B3A":"#B5562B",borderRadius:6,padding:"5px 12px",fontSize:13,fontWeight:700,marginBottom:12}}>
                              {feedback==="correct"?<Check size={14}/>:<X size={14}/>}
                              {feedback==="correct"?"Corretto!":`La risposta era: ${correctAns}`}
                            </div>
                          }
                        />
                      )}
                    </div>
                  </>
                ):null}
              </div>
            )}
          </div>
        )}

        {/* ══ VERBI MODE ══════════════════════════════════════════════ */}
        {mode==="verbi"&&(
          <div>
            {verbError==="noKey" ? (
              <div style={{textAlign:"center",padding:"40px 20px",color:"#9C8F7A",border:"1px dashed #DDD3C2",borderRadius:12}}>
                Aggiungi la tua chiave API nelle Impostazioni ⚙️ per generare gli esercizi sui verbi.
              </div>
            ) : verbLoading && !verbCurrent ? (
              <div style={{textAlign:"center",padding:"40px 20px",color:"#9C8F7A"}}>
                <Loader2 size={20} className="spin" style={{marginBottom:8}}/>
                <div style={{fontSize:14}}>Genero gli esercizi…</div>
              </div>
            ) : verbError ? (
              <div style={{textAlign:"center",padding:"40px 20px",color:"#B5562B",border:"1px dashed #DDD3C2",borderRadius:12}}>
                <div style={{marginBottom:10,fontSize:14}}>Errore: {verbError}</div>
                <button onClick={startVerbSession} style={{background:"transparent",color:"#8A7D68",fontSize:13,display:"inline-flex",alignItems:"center",gap:4}}>
                  <RefreshCw size={12}/> Riprova
                </button>
              </div>
            ) : verbCurrent ? (
              <>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:13,color:"#8A7D68",marginBottom:10}}>
                  <span>Punteggio: {verbStats.correct}/{verbStats.total}</span>
                  <span style={{fontSize:11,letterSpacing:1,fontWeight:700,color:"#B5A88F"}}>
                    {verbCurrent.type==="blank"?"COMPLETAMENTO":"TRADUZIONE"}
                  </span>
                </div>
                <div style={{background:"#fff",border:"1px solid #E7DFD3",borderRadius:14,padding:"32px 24px",textAlign:"center"}}>
                  {verbCurrent.type==="blank" ? (
                    <>
                      <div style={{fontSize:12,letterSpacing:1.5,color:"#B5562B",fontWeight:700,marginBottom:14}}>COMPLETA LA FRASE</div>
                      <div className="display" style={{fontSize:21,fontWeight:600,marginBottom:6,lineHeight:1.45}}>{verbCurrent.sentence}</div>
                      <div style={{fontSize:13,color:"#9C8F7A",fontStyle:"italic",marginBottom:22}}>({verbCurrent.infinitive})</div>
                      <div style={{marginBottom:20}}>
                        {verbFeedback===null
                          ?<ActionButton onClick={checkVerbAnswer} color="#B5562B">Verifica</ActionButton>
                          :<ActionButton onClick={nextVerbCard} color={verbFeedback==="correct"?"#4A7A4A":"#B5562B"}>
                            {verbFeedback==="correct"?<><Check size={16} style={{marginRight:6}}/>Continua</>:<><X size={16} style={{marginRight:6}}/>Continua</>}
                          </ActionButton>
                        }
                      </div>
                      <input ref={verbInputRef} value={verbAnswer} onChange={e=>setVerbAnswer(e.target.value)} onKeyDown={handleVerbKey}
                        disabled={verbFeedback!==null} autoFocus placeholder="il verbo coniugato"
                        style={{width:"100%",maxWidth:320,padding:"12px 14px",borderRadius:8,fontSize:17,textAlign:"center",
                          border:verbFeedback==="correct"?"2px solid #4A7A4A":verbFeedback==="wrong"?"2px solid #B5562B":"1px solid #DDD3C2",
                          background:verbFeedback==="correct"?"#F1F7EF":verbFeedback==="wrong"?"#FBF0EC":"#fff"}}/>
                      {verbFeedback==="wrong"&&(
                        <div style={{marginTop:14,fontSize:14,color:"#B5562B"}}>Risposta corretta: <strong>{verbCurrent.answer}</strong></div>
                      )}
                    </>
                  ) : (
                    <>
                      <div style={{fontSize:12,letterSpacing:1.5,color:"#B5562B",fontWeight:700,marginBottom:14}}>TRADUCI IN INGLESE</div>
                      <div className="display" style={{fontSize:21,fontWeight:600,marginBottom:22,lineHeight:1.45}}>{verbCurrent.it}</div>
                      {verbFeedback!=="revealed" ? (
                        <ActionButton onClick={revealTranslation} color="#B5562B">Mostra traduzione</ActionButton>
                      ) : (
                        <>
                          <div style={{background:"#FAF7F2",borderRadius:8,padding:"14px 16px",marginBottom:18,fontSize:16,color:"#2B2521"}}>{verbCurrent.en}</div>
                          <div style={{display:"flex",gap:10,justifyContent:"center"}}>
                            <ActionButton onClick={()=>selfReportTranslation(false)} color="#B5562B"><X size={16} style={{marginRight:6}}/>Sbagliato</ActionButton>
                            <ActionButton onClick={()=>selfReportTranslation(true)} color="#4A7A4A"><Check size={16} style={{marginRight:6}}/>Giusto</ActionButton>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
                {verbLoading && (
                  <div style={{textAlign:"center",fontSize:12,color:"#9C8F7A",marginTop:10,display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
                    <Loader2 size={12} className="spin"/> Preparo il prossimo blocco…
                  </div>
                )}
              </>
            ) : null}
          </div>
        )}
      </div>

      {showScrollTop && (
        <button
          onClick={()=>window.scrollTo({top:0,behavior:"smooth"})}
          title="Torna in cima"
          style={{position:"fixed",bottom:20,right:16,width:42,height:42,borderRadius:"50%",background:"#1F1A16",color:"#FAF7F2",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 10px rgba(0,0,0,0.22)",opacity:0.82,zIndex:500}}
        >
          <ChevronLeft size={18} style={{transform:"rotate(90deg)"}}/>
        </button>
      )}
    </div>
  );
}

function TabButton({active,onClick,children}){
  return <button onClick={onClick} style={{background:active?"#1F1A16":"transparent",color:active?"#FAF7F2":"#5C5246",border:active?"none":"1px solid #DDD3C2",borderRadius:7,padding:"8px 14px",fontSize:13,fontWeight:600}}>{children}</button>;
}
function ActionButton({onClick,color,children}){
  return <button onClick={onClick} style={{background:color,color:"#fff",borderRadius:8,padding:"12px 28px",fontSize:15,fontWeight:600,display:"inline-flex",alignItems:"center"}}>{children}</button>;
}
function FilterPill({active,onClick,color,children}){
  return <button onClick={onClick} style={{background:active?(color?color+"22":"#1F1A1614"):"transparent",color:active?(color||"#1F1A16"):"#5C5246",border:active?(color?`1px solid ${color}55`:"1px solid #1F1A16"):"1px solid #DDD3C2",borderRadius:20,padding:"6px 14px",fontSize:13,fontWeight:600,display:"inline-flex",alignItems:"center"}}>{children}</button>;
}
function EmptyState(){
  return <div style={{textAlign:"center",padding:"50px 20px",color:"#9C8F7A",border:"1px dashed #DDD3C2",borderRadius:12}}><BookOpen size={28} style={{marginBottom:10,opacity:0.6}}/><div style={{fontSize:15}}>Nessuna parola ancora.</div></div>;
}
