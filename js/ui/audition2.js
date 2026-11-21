// =====================================================================================
//  IDOLVERSE48: Select Bloom! — Audition expansion
// -------------------------------------------------------------------------------------
//  · Street / City / National / Worldwide keep their rates and costs (CFG.aud, unchanged).
//  · New Country Audition (CFG.aud.country): one country per audition (East & Southeast Asia),
//    costs more than National and less than Worldwide, UR rate lower than Worldwide.
//  · 1–100 candidates per audition (all types); ages 12–40 (default 12–23); age never sets rarity.
//  · Nationality: the existing fields are reused — m.nat (nationality), m.nat2 (second
//    nationality), m.heritage (heritage text) — and the existing NAT table is extended with the new
//    countries. m.herc keeps the heritage country codes so profiles can show e.g. "Thai-Korean-Japanese".
//  · Names: much larger, culture-specific name pools and naming patterns for every nationality
//    (family-name-first where that is the custom, patronymics, single names …); mixed-heritage
//    names draw from both / all sides. Collision check against members, former members, every
//    audition candidate and recently generated names; collisions are solved by drawing a new name
//    from the pools or another valid naming pattern — never by adding numbers.
//  · Results: responsive grid, 3 columns on phones, up to 5 on wide screens.
// =====================================================================================
// ---- 1. audition configuration ------------------------------------------------------------------------------
{const A=CFG.aud,o={street:A.street,city:A.city,national:A.national,country:{n:'Country Audition',base:35000,per:6000,w:{N:25,R:40,SR:30,UR:5},d:'One chosen country in East or Southeast Asia, possible UR'},world:A.world};Object.keys(A).forEach(k=>delete A[k]);Object.assign(A,o)}
CFG.audNat.country={jp:8,half:12,foreign:80};CFG.audCount.max=100;CFG.audAge.max=40;
// ---- 2. countries & nationalities (extends the existing NAT table) ------------------------------------------------
const AU_CC={'East Asia':['CN','TW','HK','KR'],'Southeast Asia':['TH','VN','SG','MY','ID','PH','MM','KH','LA','BN','TL']};
const AU_FLAG={CN:'🇨🇳',TW:'🇹🇼',HK:'🇭🇰',KR:'🇰🇷',TH:'🇹🇭',VN:'🇻🇳',SG:'🇸🇬',MY:'🇲🇾',ID:'🇮🇩',PH:'🇵🇭',MM:'🇲🇲',KH:'🇰🇭',LA:'🇱🇦',BN:'🇧🇳',TL:'🇹🇱',JP:'🇯🇵',US:'🇺🇸',UK:'🇬🇧',IN:'🇮🇳',FR:'🇫🇷',AU:'🇦🇺',CA:'🇨🇦',BR:'🇧🇷',DE:'🇩🇪',OT:'🌏'};
const auS=s=>s.split('|');
// Japanese (shared with the existing FN / LN pools, so every Japanese name grows too)
FN.push(...auS('Kokona|Shiori|Hinata|Rina|Momoka|Natsuki|Asuka|Chiaki|Fuuka|Haruka|Hikari|Ichika|Izumi|Kaede|Kanon|Karin|Kasumi|Kotone|Kurumi|Madoka|Mahiro|Makoto|Mao|Marin|Mayu|Megumi|Minori|Mirai|Mitsuki|Moe|Nagisa|Nanami|Natsumi|Nene|Nozomi|Ran|Reina|Rei|Rio|Risa|Ruri|Sana|Sayaka|Shizuku|Suzu|Suzuka|Tomoe|Tomoka|Urara|Wakana|Yayoi|Yuka|Yukino|Yume|Yuri|Yuuka|Airi|Akane|Amane|Anzu|Chinatsu|Erika|Haruna|Hazuki|Hiyori|Iroha|Kiyoka|Konomi|Kozue|Mikoto|Miyu|Mizuki|Nonoka|Riho|Sae|Sumire|Tsumugi|Uta|Yuzuha'));
LN.push(...auS('Sato|Suzuki|Takahashi|Watanabe|Ito|Yamamoto|Nakamura|Kobayashi|Kato|Yoshida|Yamada|Sasaki|Yamaguchi|Matsumoto|Inoue|Kimura|Hayashi|Shimizu|Yamazaki|Mori|Abe|Ikeda|Hashimoto|Ishikawa|Ogawa|Okada|Hasegawa|Fujita|Goto|Kondo|Murakami|Endo|Aoki|Sakamoto|Fukuda|Ota|Nishimura|Fujii|Kaneko|Okamoto|Fujiwara|Nakano|Miura|Hara|Matsuda|Takeuchi|Ueda|Morita|Takano|Kawaguchi|Shibata|Sakai|Kudo|Yokoyama|Miyazaki|Uchida|Takagi|Ando|Taniguchi|Ono|Maruyama|Imai|Kubo|Matsui|Chiba|Iwasaki|Sakurada|Nogami|Mochizuki|Asakura|Tachibana|Kurosawa|Shiratori|Hoshikawa|Kazama|Tsukimura|Amamiya|Hanazawa|Kisaragi|Yukimura'));
const AU_NAT={
 JP:{dem:'Japanese'},
 CN:{n:'China',dem:'Chinese',g:auS('Mei|Lin|Xiaoyu|Yan|Ruoxi|Jia|Wen|Ziyi|Xinyi|Yutong|Zihan|Yuxin|Shiyu|Jiayi|Mengqi|Siqi|Wanting|Yiran|Xiaoxue|Lingxi|Qingyi|Yunxi|Anqi|Keyi|Shuyan|Yuhan|Jingyi|Ziyu|Mengyao|Xinran|Yiling|Huiwen|Tingting|Lanxin|Shiqi|Yaxuan|Ruyi|Xiaoman|Yuwei|Chuxin|Nuo|Xue|Qianyu|Ruoyun|Shuang|Wanqing|Yixuan|Zhiruo|Mingyue|Jinxi'),f:auS('Zhang|Wang|Li|Zhao|Chen|Liu|Yang|Huang|Zhou|Wu|Xu|Sun|Ma|Zhu|Hu|Guo|He|Gao|Lin|Luo|Zheng|Liang|Xie|Song|Tang|Han|Feng|Deng|Cao|Peng|Zeng|Xiao|Tian|Dong|Pan|Yuan|Cai|Jiang|Yu|Du|Ye|Cheng|Wei|Su|Ding|Ren|Shen|Yao|Lu|Fang|Jin|Qin|Bai|Xia|Shi')},
 TW:{n:'Taiwan',dem:'Taiwanese',g:auS('Yu-ting|Shu-fen|Mei-ling|Pei-xin|Xin-yi|Yi-chun|Hui-min|Chia-ying|Pei-shan|Hsin-yi|Chia-hui|Ya-ting|Yi-hsuan|Szu-yu|Wan-ting|Pin-yu|Yu-chen|Hui-ju|Tzu-han|Chun-yi|Ting-yu|I-ching|Yun-hsuan|Hsiao-wei|Chih-ling|Kai-ling|Man-ting|Shih-han|Ching-wen|Yen-ting|Pei-ju|Yu-hsin|Wei-ling|Hsin-ju|Chia-chi|Ruo-yu|Yi-ting|Tzu-yu'),f:auS('Chen|Lin|Huang|Chang|Li|Wang|Wu|Liu|Tsai|Yang|Hsu|Cheng|Hsieh|Hung|Kuo|Chiu|Tseng|Liao|Lai|Chou|Yeh|Su|Chuang|Lu|Chiang|Ho|Lo|Kao|Chien|Fang|Tu|Pan|Hsiao|Shih|Ko|Peng|Tsao|Yen')},
 HK:{n:'Hong Kong',dem:'Hong Konger',g:auS('Cheuk-yi|Wing-sze|Hoi-yan|Ka-yan|Sze-wing|Tsz-ching|Hiu-tung|Man-yee|Wai-ling|Yan-ting|Pui-shan|Hoi-ching|Ching-man|Lok-yi|Sum-yi|Ka-man|Wing-yan|Hiu-lam|Tsz-yan|Oi-ling'),e:auS('Charmaine|Natalie|Kristy|Joyce|Vivian|Fiona|Michelle|Janice|Gigi|Cherry|Kelly|Stephanie|Bernice|Cecilia|Winnie|Sharon|Yvonne|Rosalind|Phoebe|Tiffany|Coco|Jessie|Mandy|Sabrina'),f:auS('Chan|Wong|Lee|Cheung|Lau|Ng|Ho|Leung|Lam|Tang|Yip|Kwok|Tsang|Fung|Mak|Chow|Lo|Yeung|Cheng|Chu|Hui|Kwan|Siu|Tam|Yuen|Choi|Lai|Poon|Wan|So|Ma|Kong|Chung|Au|Tse')},
 KR:{n:'South Korea',dem:'Korean',g:auS('Seo-yeon|Ji-woo|Min-ji|Ha-eun|Yuna|Soo-ah|Chae-won|Da-hye|Ye-jin|Su-bin|Ji-min|Hye-won|Yu-jin|Seo-hyun|Na-yeon|Ga-eun|Eun-bi|So-hee|Ye-eun|Si-yeon|Ha-rin|Ji-an|Yoon-ah|Bo-ra|Da-in|Ha-yoon|Seo-a|Chae-young|Min-seo|Ji-yoo|In-hye|So-yul|Ye-rin|Ah-young|Hyun-jin|Eun-seo|Da-eun|Su-ah|Ye-seo|Ha-neul|Bo-young|Yeon-woo'),f:auS('Kim|Lee|Park|Choi|Jung|Kang|Cho|Yoon|Jang|Lim|Han|Oh|Seo|Shin|Kwon|Hwang|Ahn|Song|Jeon|Hong|Yoo|Ko|Moon|Yang|Son|Bae|Baek|Heo|Nam|Noh|Ha|Kwak|Sung|Cha|Joo|Woo|Min|Ryu|Na|Jin')},
 TH:{n:'Thailand',dem:'Thai',g:auS('Ploy|Mint|Fah|Nok|Pim|Aom|Praew|Baifern|Siriporn|Pimchanok|Kanokwan|Natcha|Pattarawadee|Chanida|Sukanya|Warisa|Thanyarat|Supitcha|Kamonchanok|Pornthip|Rungnapa|Nattaya|Jiraporn|Sirinya|Arisa|Benjamas|Chutima|Kanyarat|Pichaya|Ratchanok|Tidarat|Wilasinee|Yupaporn|Phatcharee|Napasorn|Kwanruethai|Sasithorn|Waranya|Chalisa|Nalinthip|Ploypailin|Rinrada|Tanchanok|Wanwisa'),f:auS('Srisuk|Chaiyasit|Wongsakul|Phanthong|Charoen|Suwannarat|Kittipong|Rattanakul|Saetang|Boonmee|Thongdee|Sukjai|Prasert|Chaiprasit|Wongwan|Sirisombat|Kongkaew|Somboon|Phromma|Inthawong|Jitaree|Pongsakorn|Tangsiri|Ruangrit|Saelim|Kaewmanee|Chantarasiri|Thanakorn|Siriwat|Bunnag|Sangthong|Wattanasiri|Kaewkla|Nilsuwan|Phothisarn|Chaimongkol')},
 VN:{n:'Vietnam',dem:'Vietnamese',ff:1,mid:auS('Thi|Ngoc|Thu|Thanh|Minh|Bao|Kim|Hoai|Phuong|Khanh|Gia|Quynh|Bich|Hong|Tuyet'),g:auS('Linh|Anh|Trang|Phuong|Vy|Ngoc|Chau|My|Nhu|Tam|Ngan|An|Nhi|Mai|Han|Ha|Nhung|Tu|Hoa|Lan|Thao|Huong|Diep|Uyen|Yen|Quyen|Giang|Thuy|Hien|Van|Tien|Dung|Loan|Nga|Oanh'),f:auS('Nguyen|Tran|Le|Pham|Hoang|Huynh|Phan|Vu|Vo|Dang|Bui|Do|Ho|Ngo|Duong|Ly|Dinh|Truong|Mai|Lam|Trinh|Cao|Luong|Ha|Ta|Quach|Kieu|Thai|La|Chu')},
 SG:{n:'Singapore',dem:'Singaporean',g:auS('Rachel|Clarissa|Shannon|Valerie|Sherlyn|Jolene|Nicole|Kayla|Cheryl|Rebecca|Denise|Glenda|Joanne|Rachael|Charlene|Felicia|Amanda|Sarah|Jasmine|Ashley|Bernadette|Eunice'),c:auS('Hui Min|Jia Xin|Xin Yi|Shu Ting|Li Ting|Wei Ling|Pei Shan|Kai Xin|Yu Xuan|Jia Hui|Min Yi|En Qi'),f:auS('Tan|Lim|Lee|Ng|Ong|Wong|Goh|Chua|Chan|Koh|Teo|Ang|Yeo|Tay|Ho|Low|Toh|Sim|Chong|Chia|Seah|Foo|Heng|Quek|Yap|Lau|Phua|Soh')},
 MY:{n:'Malaysia',dem:'Malaysian',g:auS('Nur Aisyah|Siti Hajar|Nurul Izzati|Aina Sofea|Puteri Balqis|Nur Amira|Farah Nadia|Alya Natasha|Ain Najwa|Qistina|Hani Syafiqah|Nur Iman|Damia|Wardah|Sofia Irdina|Aqilah|Hanis Zalikha|Mira Filzah'),c:auS('Hui Min|Jia Xin|Xin Yi|Mei Yee|Siew Ling|Pei Wen|Yee Ting|Kar Mun|Wai Yee|Li Ying|Jia Yi|Shu Qi'),f:auS('Tan|Lim|Lee|Ng|Wong|Chong|Leong|Chin|Yap|Ooi|Khoo|Cheah|Teoh|Liew|Loh|Gan|Chai|Kok'),fa:auS('Abdullah|Ahmad|Ismail|Hassan|Yusof|Ibrahim|Osman|Mahmud|Ali|Rahman|Hamid|Salleh|Zainal|Kassim|Omar|Azman|Rosli|Hashim')},
 ID:{n:'Indonesia',dem:'Indonesian',g:auS('Putri|Ayu|Dewi|Sari|Anisa|Nadia|Citra|Fitri|Intan|Kirana|Laras|Maharani|Nabila|Rania|Salsabila|Tiara|Wulan|Zahra|Aulia|Bunga|Cinta|Dinda|Gita|Indah|Jelita|Kartika|Melati|Nia|Rara|Shinta|Ratu|Febby|Tasya|Yuki|Amelia'),f:auS('Wijaya|Santoso|Pratama|Saputra|Kusuma|Hidayat|Lestari|Purnama|Utami|Wibowo|Halim|Gunawan|Setiawan|Nugroho|Rahayu|Siregar|Hutapea|Simanjuntak|Tanjung|Nasution|Permata|Anggraini|Susanto|Wulandari|Hartono|Sinaga|Sitompul|Pangestu|Kurniawan|Ramadhani')},
 PH:{n:'Philippines',dem:'Filipino',g:auS('Andrea|Bianca|Danica|Erika|Francine|Gabrielle|Hazel|Isabel|Janelle|Katrina|Louise|Mikaela|Nadine|Patricia|Rhea|Sofia|Venice|Ysabel|Arianne|Clarisse|Daphne|Elaine|Frances|Joanna|Kyla|Lianne|Maxine|Precious|Kim|Shaira'),f:auS('Villanueva|Dela Cruz|Fernandez|Lopez|Gonzales|Castillo|Rivera|Navarro|Domingo|Salazar|Flores|Torres|Valdez|Soriano|Pascual|Manalo|Mercado|Tolentino|Ocampo|Sy|De Leon|Panganiban|Lacson|Dimaculangan|Macaraeg|Bernardo|Evangelista')},
 MM:{n:'Myanmar',dem:'Burmese',one:1,a:auS('Thandar|May|Su|Hnin|Ei|Khin|Nan|Phyu|Thet|Yamin|Zin|Wint|Hsu|Myat|Shwe|Chaw|Nwe|Aye|Htet|Thiri|Yadanar|Nilar|Sandar|Moe|Thin|Hnin Ei|Pyae|Khaing'),b:auS('Thu|Myat|Wai|Mon|Thiri|Phyu|Htar|Mar|Yee|Lae|Noe|Sin|Su|Ni|Chan|Shwe|Oo|Khaing|Zaw|Lwin|Nwe|Hlaing|Kyi|Wutyi|Theingi|Phoo|Myo|Htwe')},
 KH:{n:'Cambodia',dem:'Cambodian',ff:1,g:auS('Sreymom|Sophea|Dara|Chanthy|Sreypov|Bopha|Sokha|Kanha|Leakhena|Malis|Rachana|Sophary|Theary|Vanna|Sreyneang|Chenda|Kalyan|Mealea|Phalla|Raksmey|Sopheak|Sothea|Sreyleak|Kunthea|Nita|Monika|Sovann|Pisey'),f:auS('Sok|Chan|Kim|Heng|Seng|Meas|Chea|Keo|Prak|Ly|Nhem|Sam|Phan|Touch|Vann|Khem|Ouk|Long|Mao|Pich|Hang|Chhun|Yim|Sorn')},
 LA:{n:'Laos',dem:'Lao',g:auS('Souksavanh|Phonevilay|Chanthavy|Manivanh|Noy|Vanida|Somphone|Khamla|Phetsamone|Bouavanh|Daovy|Kesone|Latsamy|Malaythong|Nalinthone|Saysamone|Thipphavanh|Vilayvanh|Xaiyaphone|Phouthasone|Davone|Kongkeo'),f:auS('Phommachanh|Sisavath|Vongsa|Keomany|Inthavong|Souvannavong|Chanthavong|Douangmala|Khounvilay|Luangrath|Phimmasone|Sayavong|Sengdara|Thammavong|Vilaysack|Xayavong|Bounthavong|Phengsavanh|Rattanavong|Southammavong')},
 BN:{n:'Brunei',dem:'Bruneian',g:auS('Nur Syahirah|Siti Khadijah|Nurul Aqilah|Dayangku Nur|Siti Aminah|Nur Hazirah|Nurul Huda|Nur Afiqah|Hajah Nur|Nur Amalina|Siti Nurhaliza|Nur Fatin|Nurul Ain|Dayang Hafizah'),fa:auS('Abdullah|Ahmad|Ismail|Hassan|Yusof|Ibrahim|Osman|Mahmud|Ali|Rahman|Hamid|Salleh|Zainal|Kassim|Omar|Bakar|Jaafar|Matusin')},
 TL:{n:'Timor-Leste',dem:'Timorese',g:auS('Maria|Ana|Joana|Rosa|Teresa|Luisa|Filomena|Natalia|Isabel|Cristina|Juliana|Fatima|Esperanca|Domingas|Lucia|Graciana|Ines|Mariana|Beatriz|Adelaide|Olinda|Celestina|Zelia|Imaculada'),f:auS('da Silva|dos Santos|Soares|Pereira|Ximenes|Guterres|Belo|Martins|Freitas|da Costa|Amaral|Fernandes|Lopes|Carvalho|Sarmento|Pinto|Alves|Mendonca|Tilman|do Rosario|Barreto|da Cruz')},
 IN:{n:'India',dem:'Indian',g:auS('Priya|Kavya|Meera|Divya|Ananya|Ishita|Nandini|Shreya|Aditi|Kavitha|Lakshmi|Sanjana|Pooja|Riya|Tanvi|Aishwarya|Deepika|Harini|Janani|Keerthana'),f:auS('Raman|Subramaniam|Krishnan|Nair|Pillai|Menon|Iyer|Rao|Sharma|Gupta|Reddy|Chandran|Rajendran|Murugan|Naidu|Kumar|Singh|Das')},
 US:{g:auS('Emily|Ava|Madison|Chloe|Olivia|Hannah|Sophia|Grace|Lily|Abigail|Ella|Harper|Riley|Zoe|Natalie|Brooke|Savannah|Aubrey|Claire|Paige|Morgan|Sienna'),f:auS('Carter|Mitchell|Brooks|Hayes|Turner|Foster|Reed|Parker|Collins|Bailey|Morris|Bennett|Russell|Griffin|Sullivan|Ward|Coleman|Jenkins|Perry|Powell')},
 UK:{g:auS('Charlotte|Amelia|Isla|Freya|Poppy|Eleanor|Lucy|Harriet|Imogen|Matilda|Florence|Georgia|Rosie|Phoebe|Evie|Millie|Beatrice|Daisy'),f:auS('Hughes|Bennett|Fletcher|Whitaker|Ashworth|Thorne|Pemberton|Harlow|Ellison|Holloway|Kingsley|Radcliffe|Lowell|Ainsworth|Hartley|Sinclair')},
 FR:{n:'France',dem:'French',g:auS('Camille|Chloe|Lea|Manon|Ines|Juliette|Louise|Margaux|Clemence|Elise|Oceane|Amandine|Mathilde|Anais'),f:auS('Martin|Bernard|Dubois|Laurent|Moreau|Lefebvre|Girard|Mercier|Fontaine|Rousseau|Blanchard|Chevalier|Leclerc|Garnier')},
 AU:{n:'Australia',dem:'Australian',g:auS('Mia|Ruby|Sienna|Matilda|Tahlia|Jasmine|Isabella|Charlie|Willow|Indi|Ivy|Scarlett'),f:auS('Thompson|Walker|Robinson|Kelly|Ryan|Murphy|O\'Brien|Campbell|Doyle|Fraser|McKenzie|Sutherland')},
 CA:{n:'Canada',dem:'Canadian',g:auS('Avery|Brooklyn|Claire|Elodie|Gabrielle|Hailey|Juliette|Leah|Maya|Rosalie|Sophie|Taylor'),f:auS('Tremblay|Gagnon|Roy|Cote|Bouchard|Gauthier|Morin|Lavoie|MacDonald|Fraser|Campbell|Leblanc')},
 BR:{n:'Brazil',dem:'Brazilian',g:auS('Ana Clara|Beatriz|Giovanna|Isadora|Julia|Larissa|Lorena|Manuela|Mariana|Rafaela|Valentina|Yasmin|Luana|Gabriela'),f:auS('Oliveira|Souza|Lima|Pereira|Ferreira|Rodrigues|Almeida|Nascimento|Carvalho|Gomes|Ribeiro|Barbosa|Rocha|Teixeira')},
 DE:{n:'Germany',dem:'German',g:auS('Hannah|Lena|Lea|Marie|Johanna|Clara|Emilia|Greta|Frieda|Luisa|Paula|Charlotte|Ida|Mila'),f:auS('Muller|Schmidt|Schneider|Fischer|Weber|Wagner|Becker|Hoffmann|Schulz|Koch|Richter|Klein|Wolf|Neumann')}};
Object.entries(AU_NAT).forEach(([k,v])=>{if(k=='JP')return;if(!NAT[k])NAT[k]={n:v.n,dem:v.dem,g:[],f:[]};const T=NAT[k];if(v.n)T.n=v.n;if(v.dem)T.dem=v.dem;const add=(a,b)=>(b||[]).forEach(x=>{if(!a.includes(x))a.push(x)});add(T.g,v.g||[...(v.a||[]),...(v.e||[])]);add(T.f,v.f||v.b||[]);Object.assign(T,{ff:v.ff,mid:v.mid,e:v.e,c:v.c,fa:v.fa,one:v.one,a:v.a,b:v.b})});
// ---- 3. names: culture-specific patterns ------------------------------------------------------------------------------
const auP=a=>a[Math.floor(Math.random()*a.length)];
// a given name / a surname of one culture (pattern-aware)
function auGiven(c){const T=NAT[c]||NAT.OT;if(c=='HK'&&T.e&&Math.random()<.5)return auP(T.e);if((c=='SG'||c=='MY')&&T.c&&Math.random()<.45)return auP(T.c);if(c=='MM')return auP(T.a)+' '+auP(T.b);if(c=='VN')return auP(T.mid)+' '+auP(T.g);return auP(T.g)}
function auFam(c){const T=NAT[c]||NAT.OT;return auP(T.f&&T.f.length?T.f:NAT.OT.f)}
// full name of one culture
function auNameOf(c){const T=NAT[c]||NAT.OT,r=Math.random();
 if(c=='MM')return auP(T.a)+' '+auP(T.b)+(r<.25?' '+auP(T.b):'');                                // Burmese: no family name
 if(c=='VN')return auFam(c)+' '+auP(T.mid)+' '+auP(T.g);                                          // family – middle – given
 if(c=='KH')return auFam(c)+' '+auP(T.g);                                                         // family name first
 if(c=='BN')return auP(T.g)+' binti '+(r<.4?'Haji ':'')+auP(T.fa);                                // patronymic
 if(c=='MY'){if(r<.45)return auP(T.g)+' binti '+auP(T.fa);if(r<.85)return auGiven('MY').replace(/^(Nur |Siti |Puteri )/,'')+' '+auFam('MY');return auP(NAT.IN.g)+' '+auP(NAT.IN.f)}
 if(c=='SG'){if(r<.8)return(Math.random()<.5?auP(T.g):auP(T.c))+' '+auFam('SG');if(r<.9)return auP(NAT.MY.g)+' binte '+auP(NAT.MY.fa);return auP(NAT.IN.g)+' '+auP(NAT.IN.f)}
 if(c=='ID'&&r<.3)return auP(T.g)+' '+auP(T.g.filter(x=>x!=T.g[0]));                              // two given names, no family name
 if(c=='TW'||c=='HK'||c=='CN'||c=='KR'){return auGiven(c)+' '+auFam(c)}
 return auGiven(c)+' '+auFam(c)}
// a mixed-heritage name: either side, or given name from one side and family name from another
function auMixName(cs){const r=Math.random(),A=auP(cs),B=auP(cs.filter(x=>x!=A))||A;if(r<.35)return auNameOf(A);if(r<.55)return auNameOf(B);
 if(['MM','BN','VN','KH'].includes(A))return auNameOf(A);const g=A=='JP'?auP(FN):auGiven(A),f=B=='JP'?auP(LN):(['MM','BN'].includes(B)||!(NAT[B]&&(NAT[B].f||[]).length)?null:auFam(B));return f?g+' '+f:auNameOf(A)}
const auNm=c=>c=='JP'?auP(FN)+' '+auP(LN):auNameOf(c);
// ---- 4. collision check ----------------------------------------------------------------------------------------------------
function auUsed(){const U=new Set(),add=n=>{if(n)U.add(String(n).toLowerCase())};(S.members||[]).forEach(m=>{add(m.name);add(m.real);add(m.stage)});(S.alumni||[]).forEach(m=>{add(m.name);add(m.real);add(m.stage)});
 (S.auds||[]).forEach(a=>(a.cands||[]).forEach(c=>{if(c.m){add(c.m.name);add(c.m.real);add(c.m.stage)}}));(S.nameHist||[]).forEach(add);return U}
let AU_RUN=null; // one audition: used names and how often each given name was used
function auUnique(gen){const R=AU_RUN||{U:auUsed(),gc:{}};let best=null,bs=1e9;
 for(let i=0;i<60;i++){const n=gen();if(!n)continue;const k=n.toLowerCase();if(R.U.has(k))continue;const g=n.split(' ')[0].toLowerCase(),s=(R.gc[g]|0);if(s==0){best=n;break}if(s<bs){bs=s;best=n}}
 if(!best){for(let i=0;i<200&&!best;i++){const n=gen();if(n&&!R.U.has(n.toLowerCase()))best=n}}
 if(!best)best=gen();R.U.add(best.toLowerCase());const g=best.split(' ')[0].toLowerCase();R.gc[g]=(R.gc[g]|0)+1;return best}
// ---- 5. backgrounds --------------------------------------------------------------------------------------------------------
// typical heritage communities per country (for mixed backgrounds)
const AU_HER={CN:['TW','HK','KR','SG','MY'],TW:['CN','HK','KR','PH'],HK:['CN','TW','SG','UK','PH'],KR:['CN','US','TW','PH'],TH:['CN','KR','LA','MM','KH'],VN:['CN','KH','FR','KR'],SG:['CN','MY','IN','ID','PH'],MY:['CN','IN','ID','SG','TH'],ID:['CN','MY','SG','PH','AU'],PH:['CN','US','KR','ES'],MM:['CN','TH','IN'],KH:['CN','VN','TH','FR'],LA:['TH','VN','CN','FR'],BN:['MY','CN','ID','PH'],TL:['ID','BR','AU','CN']};
const auDem=c=>(NAT[c]&&NAT[c].dem)||'International',auHerOf=c=>(AU_HER[c]||['CN']).filter(x=>NAT[x]);
// Country Audition: mostly the selected country; Japanese heritage / half-Japanese less often; three countries rarely
function auBgCountry(C){const r=Math.random(),X=()=>auP(auHerOf(C));let o;
 if(r<.68)o={cat:'foreign',nat:C,nat2:null,her:null,herc:null,nm:()=>auNm(C)};                                                   // only the selected country
 else if(r<.76)o={cat:'half',nat:'JP',nat2:null,her:auDem(C),herc:[C,'JP'],nm:()=>auMixName(['JP',C])};                         // Japanese with heritage from the country
 else if(r<.84){const dual=Math.random()<.5;o={cat:'half',nat:C,nat2:dual?'JP':null,her:dual?null:'Japanese',herc:[C,'JP'],nm:()=>auMixName([C,'JP'])}} // half-Japanese
 else if(r<.88){const T=X();o={cat:'half',nat:C,nat2:'JP',her:auDem(T),herc:[C,T,'JP'],nm:()=>auMixName([C,T,'JP'])}}         // three countries
 else if(r<.96){const T=X();o={cat:'foreign',nat:C,nat2:null,her:auDem(T),herc:[C,T],nm:()=>auMixName([C,T])}}                   // the country + another heritage
 else{const T=X(),dual=Math.random()<.5;o={cat:'foreign',nat:T,nat2:dual?C:null,her:dual?null:auDem(C),herc:[T,C],nm:()=>auMixName([T,C])}}       // other international background, raised there
 return o}
// the Worldwide Audition keeps the broadest pool: every supported nationality
const AU_WORLD=['HK','VN','SG','MY','ID','MM','KH','LA','BN','TL','IN','FR','AU','CA','BR','DE'];
{const f=genBg;genBg=function(t){let b;if(t=='country'){const C=(ui.au&&ui.au.cc)||'TH';b=auBgCountry(C)}else{if(t=='world'){const n=FOREIGN.length;FOREIGN.push(...AU_WORLD.filter(k=>!FOREIGN.includes(k)));try{b=f.apply(this,arguments)}finally{FOREIGN.length=n}}else b=f.apply(this,arguments);
   // richer pools: same nationality rules as before, names from the larger, culture-specific pools
   const cs=[b.nat,b.nat2].filter(Boolean),hc=b.her?Object.keys(NAT).find(k=>NAT[k].dem==b.her):null;b.herc=cs.length>1||hc?[...cs,...(hc?[hc]:[])]:null;
   b.nm=b.herc?()=>auMixName(b.herc):()=>auNm(b.nat)}
 const g=b.nm;b.nm=()=>auUnique(g);return b}}
// recruitment / profile: the full heritage line (e.g. Thai-Korean-Japanese)
{const f=natLabel;natLabel=function(m){const h=f.apply(this,arguments);try{if(m&&Array.isArray(m.herc)&&m.herc.length>1){const d=[...new Set(m.herc)].map(auDem).join('-');return h+` · <span class="tag">${esc(d)}</span>`}}catch(e){}return h}}
// ---- 6. starting an audition: country, unique names, heritage codes, name history ------------------------------------------------
{const f=confirmAud;confirmAud=function(){const a=AU();if(a.type=='country'&&!a.cc)return toast('Choose a country for the Country Audition first.','err');AU_RUN={U:auUsed(),gc:{}};const n0=(S.auds||[]).length;let r;
 const gb=genBg;let last=null;genBg=function(){last=gb.apply(this,arguments);return last};
 const mk0=mk;mk=function(){const m=mk0.apply(this,arguments);try{if(last){m.herc=last.herc||null;last=null}}catch(e){}return m};
 try{r=f.apply(this,arguments)}finally{genBg=gb;mk=mk0;AU_RUN=null}
 try{const ss=S.auds.length>n0?S.auds.at(-1):null;if(ss&&ss.id==a.sid){if(a.type=='country')ss.cc=a.cc;S.nameHist=S.nameHist||[];ss.cands.forEach(c=>c.m&&S.nameHist.push(c.m.name));if(S.nameHist.length>1500)S.nameHist.splice(0,S.nameHist.length-1500)}}catch(e){console.error(e)}return r}}
{const f=audErr;audErr=function(a){const e=f.apply(this,arguments);if(a&&a.type=='country'&&!a.cc)e.unshift('Choose a country for the Country Audition.');return e}}
function auCC(c){const a=AU();a.cc=c;render()}
// ---- 7. setup page: country picker, 1–100 candidates, ages 12–40 ------------------------------------------------------------------
function auCountryHtml(a){const T=CFG.aud.country,N=CFG.aud.national,W=CFG.aud.world,c=a.cc;
 return`<div class="c aucc"><h3>🌏 Country Audition — choose a country</h3><p class="st">Cost ${yen(T.base)} + ${yen(T.per)} per candidate: more than the National Audition (${yen(N.base)} + ${yen(N.per)}) and less than the Worldwide Audition (${yen(W.base)} + ${yen(W.per)}). UR ${audW('country').UR}% — lower than Worldwide (UR ${audW('world').UR}%).</p>
 <div>${['UR','SR','R','N'].map(r=>`<span class="tag rr${r}">${r} ${audW('country')[r]}%</span>`).join('')}</div>
 ${Object.entries(AU_CC).map(([reg,L])=>`<h4>${reg}</h4><div class="aucg">${L.map(k=>`<button class="b s ${c==k?'p':''}" onclick="auCC('${k}')"><span class="auflag">${AU_FLAG[k]}</span> ${esc(NAT[k].n)}</button>`).join('')}</div>`).join('')}
 <p class="st">${c?`Selected: <b>${AU_FLAG[c]} ${esc(NAT[c].n)}</b>. Most candidates are ${esc(auDem(c))}; some are Japanese with ${esc(auDem(c))} heritage, half-Japanese, or have other backgrounds (rarely three countries).`:'Select a country to continue.'}</p></div>`}
{const f=V.audition;V.audition=function(){let h=f.apply(this,arguments);try{if(audSess())return h;const a=AU(),M=CFG.audCount.max,G=CFG.audAge;
  h=h.replace(/(id="acn" type="number" min="1" max=")30(")/,`$1${M}$2`).replace(/(<input type="range" min="1" max=")30(")/,`$1${M}$2`).replace(/(type="number" min="12" max=")100(")/g,`$1${G.max}$2`).replace('12–100 allowed',`${G.min}–${G.max} allowed`);
  if(a.type=='country'){const i=h.indexOf('<div class="c" style="margin-top:8px"><h3>Audition settings</h3>');if(i>=0)h=h.slice(0,i)+auCountryHtml(a)+h.slice(i)}
  h=h.split(natLine('country')).join('Chosen country ~70% · Japanese heritage / half-Japanese ~16% · Other backgrounds ~10% · Three countries ~4%');
  // summary: country + cost breakdown
  h=h.replace(/(<div class="c" style="margin-top:8px"><h3>Summary<\/h3><div>)([^<]*)/,(x,p,t)=>p+t+(a.type=='country'&&a.cc?` · ${AU_FLAG[a.cc]} ${esc(NAT[a.cc].n)}`:''));
  const T=CFG.aud[a.type];h=h.replace(/(<div class="big">Total)/,`<div class="st">Base cost ${yen(T.base)} · Per candidate ${yen(T.per)}</div>$1`)}catch(e){console.error(e)}return h}}
// keep the live total when the count field is typed into
{const f=auSet;auSet=function(k,v){if(k=='count'){const n=Number(v);if(Number.isFinite(n))v=String(Math.max(CFG.audCount.min,Math.min(CFG.audCount.max,Math.round(n))))}if(k=='amin'||k=='amax'){const n=Number(v);if(Number.isFinite(n))v=String(Math.max(CFG.audAge.min,Math.min(CFG.audAge.max,Math.round(n))))}return f.call(this,k,v)}}
// ---- 8. results: responsive candidate grid -------------------------------------------------------------------------------------
candCard=function(c,a){const m=c.st=='recruited'?get(c.id):c.m;if(!m)return'';const pd=c.st=='pending',nat=[m.nat,m.nat2].filter(Boolean).map(k=>`${AU_FLAG[k]||''} ${esc(k=='OT'?(m.natOther||'Other'):(NAT[k]||NAT.OT).n)}`).join(' / '),her=Array.isArray(m.herc)&&m.herc.length>1?[...new Set(m.herc)].map(auDem).join('-'):m.heritage?'Heritage: '+m.heritage:'';
 return`<div class="c aucard ${c.sel?'sel':''} ${pd?'':'off'}"><div class="aupt" onclick="ui.mod={t:'cprof',id:${m.id}};render()">${pt(m,0)}<span class="tag rr${m.rar}">${m.rar}</span></div><b class="aunm">${esc(m.stage||m.name)}</b><small>${m.age}y · ${nat}</small>${her?`<small class="st">${esc(her)}</small>`:''}
 <div class="aubt"><button class="b s" onclick="ui.mod={t:'cprof',id:${m.id}};render()">Profile</button>${pd?`<button class="b s ${c.sel?'on':''}" onclick="togSel(${m.id})">${c.sel?'✔':'Select'}</button><button class="b s" onclick="rejectOne(${m.id})">✕</button>`:`<span class="tag">${c.st=='recruited'?'Recruited':'Rejected'}</span>`}</div></div>`};
{const f=resultsHtml;resultsHtml=function(a){let h=f.apply(this,arguments);try{h=h.replace('<div class="g2" style="margin-top:10px">','<div class="aug" style="margin-top:10px">');if(a.type=='country'&&a.cc)h=h.replace(/(· Results<\/h2>)/,` · ${AU_FLAG[a.cc]} ${esc(NAT[a.cc].n)}$1`)}catch(e){}return h}}
