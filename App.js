import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useVideoPlayer, VideoView } from 'expo-video';
import { initialContent, loadContent } from './src/contentStore';

const colors = {
  ink: '#1E2B27', cream: '#F7F1E7', paper: '#FFFCF6', green: '#1E604C',
  lightGreen: '#DDEAE3', orange: '#DF6C37', sand: '#E9D6B8', muted: '#66736D', white: '#FFFFFF',
};

const tabs = [
  { id: 'inicio', label: 'Início', icon: 'home-outline', activeIcon: 'home' },
  { id: 'explorar', label: 'Explorar', icon: 'compass-outline', activeIcon: 'compass' },
  { id: 'agenda', label: 'Agenda', icon: 'calendar-outline', activeIcon: 'calendar' },
  { id: 'historias', label: 'Histórias', icon: 'people-outline', activeIcon: 'people' },
];

function StoryVideo({ uri, caption }) {
  const player = useVideoPlayer(uri, instance => { instance.loop = false; });
  return <View style={styles.videoBlock}>
    <VideoView player={player} style={styles.video} nativeControls allowsFullscreen />
    {caption ? <Text style={styles.videoCaption}>{caption}</Text> : null}
  </View>;
}

function SectionTitle({ eyebrow, title, action, onAction }) {
  return <View style={styles.sectionHeading}>
    <View style={{ flex: 1 }}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {action ? <Pressable onPress={onAction} hitSlop={10}><Text style={styles.sectionAction}>{action}  →</Text></Pressable> : null}
  </View>;
}

function PlaceCard({ item, onPress, wide = false }) {
  return <Pressable onPress={() => onPress(item)} style={[styles.placeCard, wide && styles.placeCardWide]}>
    <Image source={{ uri: item.image }} style={styles.placeImage} />
    <LinearGradient colors={['transparent', 'rgba(10,25,20,.84)']} style={styles.cardGradient} />
    <View style={styles.placeOverlay}>
      <Text style={styles.placeRegion}>{item.region}</Text>
      <Text style={styles.placeName}>{item.name}</Text>
      <Text style={styles.placeDescription} numberOfLines={2}>{item.description}</Text>
    </View>
  </Pressable>;
}

function EventRow({ item }) {
  return <View style={styles.eventRow}>
    <View style={styles.eventDate}><Text style={styles.eventDay}>{item.day}</Text><Text style={styles.eventMonth}>{item.month}</Text></View>
    <View style={styles.eventInfo}>
      <View style={styles.eventMeta}><Text style={styles.eventCategory}>{item.category}</Text>{item.free ? <Text style={styles.freePill}>GRÁTIS</Text> : null}</View>
      <Text style={styles.eventTitle}>{item.title}</Text>
      <Text style={styles.eventPlace}><Ionicons name="location-outline" size={13} /> {item.place} · {item.city}</Text>
    </View>
    <Text style={styles.eventTime}>{item.time}</Text>
  </View>;
}

function StoryCard({ item, onPress, horizontal = false }) {
  return <Pressable onPress={() => onPress(item)} style={[styles.storyCard, horizontal && styles.storyCardHorizontal]}>
    <Image source={{ uri: item.image }} style={[styles.storyImage, horizontal && styles.storyImageHorizontal]} />
    <View style={styles.storyBody}>
      <Text style={styles.storyPlace}>{item.place}</Text>
      <Text style={styles.storyPerson}>{item.person}</Text>
      <Text style={styles.storyExcerpt} numberOfLines={horizontal ? 3 : 2}>“{item.excerpt}”</Text>
      <Text style={styles.readTime}>{item.readTime} de leitura  →</Text>
    </View>
  </Pressable>;
}

function Home({ goTo, openPlace, openStory, places, stories, events }) {
  return <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageBottom}>
    <View style={styles.hero}>
      <Image source={{ uri: places[0].image }} style={StyleSheet.absoluteFillObject} />
      <LinearGradient colors={['rgba(15,46,37,.18)', 'rgba(15,46,37,.92)']} style={StyleSheet.absoluteFillObject} />
      <View style={styles.topBrand}><View style={styles.brandMark}><Ionicons name="sunny" color={colors.cream} size={21} /></View><Text style={styles.brand}>GUIA CULTURAL{`\n`}DO CEARÁ</Text></View>
      <View style={styles.heroCopy}>
        <Text style={styles.heroKicker}>MEMÓRIA · CULTURA · ENCONTROS</Text>
        <Text style={styles.heroTitle}>O Ceará que vive em cada história.</Text>
        <Text style={styles.heroText}>Conheça lugares, pessoas e manifestações que formam a identidade do nosso estado.</Text>
        <Pressable style={styles.heroButton} onPress={() => goTo('explorar')}><Text style={styles.heroButtonText}>Explorar o Ceará</Text><Ionicons name="arrow-forward" color={colors.green} size={18} /></Pressable>
      </View>
    </View>

    <View style={styles.content}>
      <SectionTitle eyebrow="DESCUBRA" title="Territórios e memórias" action="Ver todos" onAction={() => goTo('explorar')} />
      <FlatList horizontal data={places} keyExtractor={i => i.id} renderItem={({ item }) => <PlaceCard item={item} onPress={openPlace} />} showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14 }} />

      <View style={styles.manifesto}>
        <Ionicons name="quote" size={24} color={colors.orange} />
        <Text style={styles.manifestoText}>Um acervo vivo, feito para preservar as vozes, os gestos e as paisagens do Ceará.</Text>
        <Text style={styles.manifestoCaption}>ACESSO LIVRE · CONTEÚDO AUTORAL</Text>
      </View>

      <SectionTitle eyebrow="VOZES DO CEARÁ" title="Histórias que ficam" action="Ler todas" onAction={() => goTo('historias')} />
      <StoryCard item={stories[0]} onPress={openStory} horizontal />

      <SectionTitle eyebrow="PRÓXIMOS DIAS" title="Agenda cultural" action="Agenda completa" onAction={() => goTo('agenda')} />
      <View style={styles.eventList}>{events.slice(0, 3).map(item => <EventRow key={item.id} item={item} />)}</View>
    </View>
  </ScrollView>;
}

function Explore({ openPlace, places }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Todos');
  const filters = ['Todos', 'Litoral', 'Serra', 'Capital', 'Cariri'];
  const result = useMemo(() => places.filter(p => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || `${p.name} ${p.region} ${p.tags.join(' ')}`.toLowerCase().includes(q);
    const matchesFilter = filter === 'Todos' || p.region.toLowerCase().includes(filter.toLowerCase());
    return matchesQuery && matchesFilter;
  }), [query, filter]);
  return <FlatList data={result} keyExtractor={i => i.id} renderItem={({ item }) => <PlaceCard item={item} onPress={openPlace} wide />} contentContainerStyle={styles.listPage} ItemSeparatorComponent={() => <View style={{ height: 16 }} />} ListHeaderComponent={<>
    <PageHeader eyebrow="PELO CEARÁ" title="Explore territórios" subtitle="Encontre paisagens, saberes e histórias de cada região." />
    <View style={styles.search}><Ionicons name="search" size={20} color={colors.muted} /><TextInput value={query} onChangeText={setQuery} placeholder="Buscar cidade, praia ou cultura" placeholderTextColor="#87908B" style={styles.searchInput} /></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{filters.map(item => <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filter, item === filter && styles.filterActive]}><Text style={[styles.filterText, item === filter && styles.filterTextActive]}>{item}</Text></Pressable>)}</ScrollView>
    <Text style={styles.resultCount}>{result.length} TERRITÓRIOS ENCONTRADOS</Text>
  </>} ListEmptyComponent={<View style={styles.empty}><Ionicons name="map-outline" size={38} color={colors.muted} /><Text style={styles.emptyTitle}>Nenhum território encontrado</Text><Text style={styles.emptyText}>Tente buscar outro nome ou região.</Text></View>} />;
}

function PageHeader({ eyebrow, title, subtitle }) {
  return <View style={styles.pageHeader}><Text style={styles.eyebrow}>{eyebrow}</Text><Text style={styles.pageTitle}>{title}</Text><Text style={styles.pageSubtitle}>{subtitle}</Text></View>;
}

function Agenda({ events }) {
  const [category, setCategory] = useState('Todos');
  const categories = ['Todos', 'Música', 'Literatura', 'Cinema', 'Teatro'];
  const filtered = category === 'Todos' ? events : events.filter(e => e.category === category);
  return <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listPage}>
    <PageHeader eyebrow="PROGRAME-SE" title="Agenda cultural" subtitle="Eventos para viver a cultura cearense de perto." />
    <View style={styles.agendaBanner}><View><Text style={styles.agendaBannerSmall}>JULHO & AGOSTO</Text><Text style={styles.agendaBannerTitle}>Cultura em movimento</Text></View><Ionicons name="calendar" size={36} color={colors.orange} /></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{categories.map(item => <Pressable key={item} onPress={() => setCategory(item)} style={[styles.filter, item === category && styles.filterActive]}><Text style={[styles.filterText, item === category && styles.filterTextActive]}>{item}</Text></Pressable>)}</ScrollView>
    <View style={[styles.eventList, { marginTop: 18 }]}>{filtered.map(item => <EventRow key={item.id} item={item} />)}</View>
    <Text style={styles.disclaimer}>Programação demonstrativa. Confirme datas e horários com os espaços culturais.</Text>
  </ScrollView>;
}

function Stories({ openStory, stories }) {
  return <FlatList data={stories} keyExtractor={i => i.id} renderItem={({ item }) => <StoryCard item={item} onPress={openStory} />} numColumns={2} columnWrapperStyle={{ gap: 12 }} contentContainerStyle={styles.listPage} ItemSeparatorComponent={() => <View style={{ height: 12 }} />} ListHeaderComponent={<PageHeader eyebrow="MEMÓRIA ORAL" title="Histórias das pessoas" subtitle="Retratos e relatos de quem mantém a cultura viva." />} />;
}

function DetailModal({ detail, onClose, stories }) {
  if (!detail) return null;
  const isPlace = detail.kind === 'place';
  const item = detail.item;
  return <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
    <SafeAreaView style={styles.modalSafe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.detailHero}>
          <Image source={{ uri: item.image }} style={StyleSheet.absoluteFillObject} />
          <LinearGradient colors={['rgba(0,0,0,.05)', 'rgba(15,35,29,.83)']} style={StyleSheet.absoluteFillObject} />
          <Pressable onPress={onClose} style={styles.closeButton}><Ionicons name="close" size={24} color={colors.ink} /></Pressable>
          <View style={styles.detailHeroCopy}>
            <Text style={styles.detailKicker}>{isPlace ? item.region : `${item.place} · ${item.readTime}`}</Text>
            <Text style={styles.detailTitle}>{isPlace ? item.name : item.person}</Text>
            {!isPlace ? <Text style={styles.detailRole}>{item.role}</Text> : null}
          </View>
        </View>
        <View style={styles.detailContent}>
          {isPlace ? <>
            <Text style={styles.lead}>{item.description}</Text>
            <Text style={styles.bodyText}>{item.longDescription}</Text>
            <View style={styles.tagRow}>{item.tags.map(tag => <Text style={styles.detailTag} key={tag}>{tag}</Text>)}</View>
            <View style={styles.statCard}><Ionicons name="images-outline" size={26} color={colors.green} /><View><Text style={styles.statNumber}>{item.photos} registros</Text><Text style={styles.statLabel}>no acervo fotográfico</Text></View></View>
            <SectionTitle eyebrow="DO TERRITÓRIO" title="Uma história para conhecer" />
            {stories.filter(s => s.place.includes(item.name.split(' ')[0])).map(story => <StoryCard key={story.id} item={story} onPress={() => {}} horizontal />)}
          </> : <>
            <Text style={styles.quote}>“{item.excerpt}”</Text>
            <Text style={styles.bodyText}>{item.text}</Text>
            {item.video ? <StoryVideo uri={item.video} caption={item.videoCaption} /> : null}
            <View style={styles.authorNote}><Ionicons name="camera-outline" size={22} color={colors.orange} /><Text style={styles.authorNoteText}>Retrato e história produzidos para o acervo cultural do projeto.</Text></View>
          </>}
        </View>
      </ScrollView>
    </SafeAreaView>
  </Modal>;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [detail, setDetail] = useState(null);
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    loadContent().then(setContent);
    if (Platform.OS === 'web' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
      if (!document.querySelector('link[rel="manifest"]')) {
        const manifest = document.createElement('link');
        manifest.rel = 'manifest';
        manifest.href = '/manifest.json';
        document.head.appendChild(manifest);
      }
    }
  }, []);

  const openPlace = item => setDetail({ kind: 'place', item });
  const openStory = item => setDetail({ kind: 'story', item });
  const { places, stories, events } = content;
  const screens = {
    inicio: <Home goTo={setActiveTab} openPlace={openPlace} openStory={openStory} places={places} stories={stories} events={events} />,
    explorar: <Explore openPlace={openPlace} places={places} />,
    agenda: <Agenda events={events} />,
    historias: <Stories openStory={openStory} stories={stories} />,
  };
  return <View style={styles.app}>
    <ExpoStatusBar style={activeTab === 'inicio' ? 'light' : 'dark'} />
    <SafeAreaView style={[styles.safe, activeTab === 'inicio' && styles.safeHero]}>{screens[activeTab]}</SafeAreaView>
    <View style={styles.tabBar}>{tabs.map(tab => { const active = tab.id === activeTab; return <Pressable key={tab.id} onPress={() => setActiveTab(tab.id)} style={styles.tab}><Ionicons name={active ? tab.activeIcon : tab.icon} size={22} color={active ? colors.green : '#89918D'} /><Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text></Pressable>; })}</View>
    <DetailModal detail={detail} onClose={() => setDetail(null)} stories={stories} />
  </View>;
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: colors.cream }, safe: { flex: 1, backgroundColor: colors.cream, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }, safeHero: { paddingTop: 0 }, pageBottom: { paddingBottom: 28 },
  hero: { height: 610, justifyContent: 'space-between', paddingHorizontal: 22, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 18 : 22, paddingBottom: 40 },
  topBrand: { flexDirection: 'row', alignItems: 'center', gap: 10 }, brandMark: { width: 38, height: 38, borderWidth: 1, borderColor: 'rgba(255,255,255,.6)', borderRadius: 19, alignItems: 'center', justifyContent: 'center' }, brand: { color: colors.white, fontWeight: '800', fontSize: 11, lineHeight: 13, letterSpacing: 1.4 },
  heroCopy: { maxWidth: 410 }, heroKicker: { color: '#F6D4A0', fontSize: 11, fontWeight: '800', letterSpacing: 1.7, marginBottom: 12 }, heroTitle: { color: colors.white, fontSize: 42, lineHeight: 45, fontWeight: '800', letterSpacing: -.8 }, heroText: { color: 'rgba(255,255,255,.85)', fontSize: 16, lineHeight: 24, marginTop: 15, maxWidth: 350 }, heroButton: { marginTop: 24, backgroundColor: colors.cream, borderRadius: 26, alignSelf: 'flex-start', paddingVertical: 14, paddingHorizontal: 20, flexDirection: 'row', gap: 14, alignItems: 'center' }, heroButtonText: { color: colors.green, fontSize: 14, fontWeight: '800' },
  content: { paddingHorizontal: 18 }, sectionHeading: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 32, marginBottom: 16 }, eyebrow: { color: colors.orange, fontSize: 10, fontWeight: '900', letterSpacing: 1.8, marginBottom: 5 }, sectionTitle: { color: colors.ink, fontSize: 25, fontWeight: '800', letterSpacing: -.4 }, sectionAction: { color: colors.green, fontSize: 12, fontWeight: '800', marginBottom: 4 },
  placeCard: { width: 276, height: 340, borderRadius: 20, overflow: 'hidden', backgroundColor: colors.sand }, placeCardWide: { width: '100%', height: 310 }, placeImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' }, cardGradient: { ...StyleSheet.absoluteFillObject }, placeOverlay: { position: 'absolute', left: 18, right: 18, bottom: 18 }, placeRegion: { color: '#F6D4A0', fontSize: 10, fontWeight: '900', letterSpacing: 1.3, textTransform: 'uppercase' }, placeName: { color: colors.white, fontSize: 25, fontWeight: '800', marginTop: 4 }, placeDescription: { color: 'rgba(255,255,255,.82)', fontSize: 13, lineHeight: 18, marginTop: 5 },
  manifesto: { backgroundColor: colors.lightGreen, borderRadius: 20, padding: 22, marginTop: 30 }, manifestoText: { color: colors.green, fontSize: 20, fontWeight: '700', lineHeight: 28, marginTop: 8 }, manifestoCaption: { color: colors.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1.4, marginTop: 17 },
  storyCard: { flex: 1, minWidth: 0, backgroundColor: colors.paper, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: '#EDE5D9' }, storyCardHorizontal: { flexDirection: 'row', minHeight: 190 }, storyImage: { width: '100%', height: 176, backgroundColor: colors.sand }, storyImageHorizontal: { width: '40%', height: '100%' }, storyBody: { flex: 1, padding: 15 }, storyPlace: { color: colors.orange, fontSize: 9, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.2 }, storyPerson: { color: colors.ink, fontWeight: '800', fontSize: 19, marginTop: 4 }, storyExcerpt: { color: colors.muted, fontSize: 13, lineHeight: 19, fontStyle: 'italic', marginTop: 7 }, readTime: { color: colors.green, fontSize: 11, fontWeight: '800', marginTop: 12 },
  eventList: { backgroundColor: colors.paper, borderRadius: 18, paddingHorizontal: 14, borderWidth: 1, borderColor: '#EDE5D9' }, eventRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#D8D3CA' }, eventDate: { width: 46, height: 53, backgroundColor: colors.lightGreen, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, eventDay: { color: colors.green, fontSize: 21, lineHeight: 22, fontWeight: '900' }, eventMonth: { color: colors.green, fontSize: 9, fontWeight: '900' }, eventInfo: { flex: 1, paddingHorizontal: 12 }, eventMeta: { flexDirection: 'row', alignItems: 'center', gap: 7 }, eventCategory: { color: colors.orange, fontSize: 9, fontWeight: '900', textTransform: 'uppercase', letterSpacing: .7 }, freePill: { color: colors.green, backgroundColor: colors.lightGreen, fontSize: 8, paddingHorizontal: 5, paddingVertical: 2, fontWeight: '900', borderRadius: 4 }, eventTitle: { color: colors.ink, fontSize: 15, fontWeight: '800', marginTop: 4 }, eventPlace: { color: colors.muted, fontSize: 10, marginTop: 5 }, eventTime: { color: colors.ink, fontSize: 11, fontWeight: '800', alignSelf: 'flex-start', marginTop: 5 },
  listPage: { paddingHorizontal: 18, paddingBottom: 28 }, pageHeader: { paddingTop: 25, paddingBottom: 20 }, pageTitle: { color: colors.ink, fontSize: 34, fontWeight: '900', letterSpacing: -.7 }, pageSubtitle: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 7, maxWidth: 340 }, search: { height: 52, backgroundColor: colors.paper, borderRadius: 14, borderWidth: 1, borderColor: '#E5DDD0', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginBottom: 13 }, searchInput: { flex: 1, height: '100%', marginLeft: 10, fontSize: 14, color: colors.ink }, filters: { gap: 8, paddingVertical: 2, paddingRight: 15 }, filter: { borderWidth: 1, borderColor: '#D7D0C5', paddingVertical: 9, paddingHorizontal: 15, borderRadius: 20, backgroundColor: colors.paper }, filterActive: { borderColor: colors.green, backgroundColor: colors.green }, filterText: { color: colors.muted, fontSize: 12, fontWeight: '700' }, filterTextActive: { color: colors.white }, resultCount: { color: colors.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1.2, marginVertical: 18 }, empty: { alignItems: 'center', padding: 40 }, emptyTitle: { fontWeight: '800', color: colors.ink, fontSize: 17, marginTop: 12 }, emptyText: { color: colors.muted, marginTop: 5 },
  agendaBanner: { backgroundColor: colors.green, borderRadius: 18, padding: 20, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, agendaBannerSmall: { color: '#F6D4A0', fontSize: 9, letterSpacing: 1.4, fontWeight: '900' }, agendaBannerTitle: { color: colors.white, fontSize: 21, fontWeight: '800', marginTop: 4 }, disclaimer: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 15, textAlign: 'center' },
  tabBar: { height: Platform.OS === 'ios' ? 82 : 68, paddingBottom: Platform.OS === 'ios' ? 17 : 5, flexDirection: 'row', backgroundColor: colors.paper, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#D8D1C6', paddingTop: 8 }, tab: { flex: 1, alignItems: 'center', gap: 3 }, tabLabel: { fontSize: 9, fontWeight: '700', color: '#89918D' }, tabLabelActive: { color: colors.green },
  modalSafe: { flex: 1, backgroundColor: colors.cream }, detailHero: { height: 430, justifyContent: 'flex-end' }, closeButton: { position: 'absolute', right: 18, top: Platform.OS === 'android' ? 18 : 10, width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,252,246,.94)', alignItems: 'center', justifyContent: 'center' }, detailHeroCopy: { padding: 24 }, detailKicker: { color: '#F6D4A0', fontSize: 10, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' }, detailTitle: { color: colors.white, fontSize: 37, fontWeight: '900', marginTop: 5 }, detailRole: { color: 'rgba(255,255,255,.8)', fontSize: 14, marginTop: 3 }, detailContent: { padding: 22, paddingBottom: 50 }, lead: { color: colors.green, fontSize: 22, lineHeight: 31, fontWeight: '800' }, bodyText: { color: '#46534E', fontSize: 16, lineHeight: 27, marginTop: 18 }, tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 20 }, detailTag: { backgroundColor: colors.lightGreen, color: colors.green, fontSize: 11, fontWeight: '800', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 }, statCard: { marginTop: 25, backgroundColor: colors.paper, borderWidth: 1, borderColor: '#E8E0D4', padding: 18, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }, statNumber: { color: colors.ink, fontSize: 17, fontWeight: '900' }, statLabel: { color: colors.muted, fontSize: 11, marginTop: 2 }, quote: { color: colors.green, fontSize: 25, lineHeight: 35, fontWeight: '800', fontStyle: 'italic' }, authorNote: { backgroundColor: '#F2E4D4', padding: 16, borderRadius: 14, marginTop: 25, flexDirection: 'row', alignItems: 'center', gap: 12 }, authorNoteText: { flex: 1, color: colors.muted, fontSize: 12, lineHeight: 18 },
  videoBlock: { marginTop: 24 }, video: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#101713', borderRadius: 16, overflow: 'hidden' }, videoCaption: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 8 },
});
