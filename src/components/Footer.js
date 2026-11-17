import "../styles/Footer.css";
import logo from "../assets/img/logo.png";
import LogoutIcon from "../assets/icon/logout.png";
import { NavLink } from "react-router-dom";

function Footer() {
    return (
        <footer className="footer">
            {/* 로고 */}
            <div className="footer-top">
                <img src={logo} alt="LTE 로고" className = "footer-logo" />
                <span className = "footer-title">Lion To-do Everyday</span>
            </div>

            {/* 설명 */}
            <div className="footer-introduction">
            LTE는 한국항공대학교 멋쟁이사자처럼에서 개발한 투두 관리 기반의 웹 서비스입니다.
            </div>
            

            {/* 멋쟁이사자처럼 정보 */}
            <div className="footer-info">
                <div className="footer-description">
                    <span>상호명</span>
                    <span>한국항공대학교 멋쟁이사자처럼</span>

                    <span>대표자</span>
                    <span>전유안</span>

                    <span>주소</span>
                    <span>경기도 고양시 항공대학로76 항공우주센터 3층 창업카페</span>
                </div>   

                <div className="footer-description">
                    <span>사업자등록번호</span>
                    <span>333-22-55555</span>

                    <span>개인정보보호책임자</span>
                    <span>전유안</span>

                    <span>이메일</span>
                    <span>kimyena4930@naver.com</span>

                    <span>전화번호</span>
                    <span>010-1234-5678</span>
                </div>
            </div>
        </footer>
    );
}

export default Footer;