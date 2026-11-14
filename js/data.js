/*
 * Dados de demonstração inspirados em arquitetos e escritórios históricos
 * ligados à arquitetura moderna carioca e à trajetória da FAU UFRJ / NPD.
 * No AtoM, os campos viriam de QubitInformationObject (nível "Fundo"):
 *   ref     -> identifier / referenceCode
 *   title   -> getTitle() (nome do arquiteto ou escritório produtor)
 *   kind    -> tipo de entidade do produtor ("Arquiteto(a)" / "Escritório")
 *   dates   -> getDates() (datas-limite de produção)
 *   start   -> ano inicial para ordenação cronológica
 *   series  -> nº de filhos com nível "Série"
 *   extent  -> extentAndMedium
 *   image   -> caminho da representação digital (miniatura)
 */
window.NPD_FONDS = [
  { ref: "BR RJ UFRJ NPD JMM", title: "Jorge Machado Moreira", kind: "Arquiteto", dates: "1932–1992", start: 1932, series: 14, extent: "12.400 desenhos", image: "img/01.jpg" },
  { ref: "BR RJ UFRJ NPD AER", title: "Affonso Eduardo Reidy", kind: "Arquiteto", dates: "1929–1964", start: 1929, series: 11, extent: "4.850 pranchas", image: "img/02.jpg" },
  { ref: "BR RJ UFRJ NPD MMM", title: "MMM Roberto", kind: "Escritório", dates: "1936–1981", start: 1936, series: 16, extent: "18.200 desenhos", image: "img/03.jpg" },
  { ref: "BR RJ UFRJ NPD SBE", title: "Sérgio Bernardes", kind: "Arquiteto", dates: "1948–2002", start: 1948, series: 19, extent: "24.000 itens", image: "img/04.jpg" },
  { ref: "BR RJ UFRJ NPD CPO", title: "Carmen Portinho", kind: "Engenheira e Urbanista", dates: "1930–1998", start: 1930, series: 8, extent: "42 caixas", image: "img/05.jpg" },
  { ref: "BR RJ UFRJ NPD ETU", title: "Escritório Técnico da Universidade do Brasil", kind: "Escritório", dates: "1949–1972", start: 1949, series: 12, extent: "9.600 pranchas", image: "img/06.jpg" },
  { ref: "BR RJ UFRJ NPD ATO", title: "Aldary Henriques Toledo", kind: "Arquiteto", dates: "1942–1988", start: 1942, series: 7, extent: "3.120 desenhos", image: "img/07.jpg" },
  { ref: "BR RJ UFRJ NPD FBO", title: "Francisco Bolonha", kind: "Arquiteto", dates: "1945–1996", start: 1945, series: 9, extent: "5.400 pranchas", image: "img/08.jpg" },
  { ref: "BR RJ UFRJ NPD ABR", title: "Alcides da Rocha Miranda", kind: "Arquiteto", dates: "1934–1991", start: 1934, series: 6, extent: "2.300 desenhos", image: "img/09.jpg" },
  { ref: "BR RJ UFRJ NPD FNP", title: "Firmino Saldanha", kind: "Arquiteto", dates: "1938–1985", start: 1938, series: 5, extent: "1.890 itens", image: "img/10.jpg" },
  { ref: "BR RJ UFRJ NPD HMD", title: "Henrique Mindlin Arquitetos Associados", kind: "Escritório", dates: "1941–1971", start: 1941, series: 13, extent: "11.300 pranchas", image: "img/11.jpg" },
  { ref: "BR RJ UFRJ NPD LCO", title: "Lygia Fernandes", kind: "Arquiteta", dates: "1951–1994", start: 1951, series: 6, extent: "2.750 desenhos", image: "img/12.jpg" }
];
