import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import PageTransition from '../components/PageTransition.jsx';

export default function PublicLayout(){
    return (
        <>
        <Header />
        <main>
            <PageTransition />
        </main>
        <Footer />
        </>

    )
}
