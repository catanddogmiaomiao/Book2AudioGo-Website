import type { Lang, StorePath } from "./languages";

export const SUPPORT_EMAIL = "book2audiogo@hotmail.com";

type TextLink = { href: string; label: string };
type Section = { title: string; text: string; links?: TextLink[] };
type Policy = { title: string; intro: string; sections: Section[] };

const buyerTerms = "https://www.paddle.com/legal/buyer-terms";
const refundPolicy = "https://www.paddle.com/legal/refund-policy";
const paymentSupport = "https://paddle.net/";
const paddlePrivacy = "https://www.paddle.com/legal/privacy";

export const policies: Record<Lang, Record<Exclude<StorePath, "/pricing">, Policy>> = {
  en: {
    "/terms": {
      title: "Terms of Service",
      intro: "These terms cover the Book2Audio GO website and Windows app, provided by Book2AudioGo Group.",
      sections: [
        { title: "Using the app", text: "Book2Audio GO grants you a limited license to use the software. Convert only books and documents you are authorized to use and respect any rights or restrictions that apply to the source material and resulting audio. Do not bypass copy protection or share audio without the necessary permissions." },
        { title: "Free and Pro licenses", text: "The free version supports manual chapter conversion. Paid Pro features include batch conversion and the reading plan. The advertised Paddle Pro option is a one-time license for one active device, with no automatic renewal. When switching devices, unlink the previous device in your account and then activate the new one. For a redemption code, check its duration and conditions in the listing before buying." },
        { title: "Purchases and support", text: "Redemption codes are currently sold through Xianyu. If Paddle checkout becomes available, Paddle will handle payment as the authorized reseller under its Buyer Terms. For product or license help, use the Feedback button on this site.",
          links: [{ href: buyerTerms, label: "Paddle Buyer Terms" }] },
        { title: "Third-party services and consumer rights", text: "Online speech synthesis depends on the availability of the selected provider. Some formats require extractable text. Applicable consumer guarantees and statutory rights continue to apply." },
      ],
    },
    "/privacy": {
      title: "Privacy Policy",
      intro: "This policy explains how Book2Audio GO handles data through its website, account service and Windows app. Book2AudioGo Group handles the data described below.",
      sections: [
        { title: "Books, text and audio", text: "The app parses books and saves exported audio on your device. With a local TTS model, speech synthesis runs on your device. With online speech synthesis, the text needed for conversion is sent to the selected online speech service for processing. The Microsoft online voices receive the selected text and voice settings through Edge TTS." },
        { title: "Accounts and licenses", text: "We process account information such as username and email, verification records, device activation details and purchase or redemption records to sign you in, manage Pro access and help resolve support requests. Resend delivers verification and password reset emails." },
        { title: "Feedback and usage information", text: "We store the message you submit and any email address or rating you choose to provide so we can review and respond. We use network information to limit abuse. Website statistics may include approximate region, page visits and downloads. Optional desktop analytics are off by default. If enabled in the app settings, they record an installation identifier and events such as imports, conversions and activation, without book contents or file paths. These events are kept for 90 days." },
        { title: "Payments and service providers", text: "Cloudflare hosts the website and supports the account service. Xianyu handles purchases made on its platform. For Paddle orders, Paddle handles payment and billing information under its own privacy policy. We use transaction identifiers and payment status to apply or update the license.",
          links: [{ href: paddlePrivacy, label: "Paddle Privacy Policy" }] },
        { title: "Retention and privacy requests", text: "We keep information as needed to provide the service, administer licenses, respond to requests, prevent abuse and comply with applicable obligations. You can ask about access, correction or deletion using the Feedback button on this site. Include a reply email so we can follow up." },
      ],
    },
    "/refunds": {
      title: "Refund Policy",
      intro: "Use the channel through which you purchased Book2Audio GO Pro to request a refund.",
      sections: [
        { title: "Xianyu redemption codes", text: "Open the original Xianyu order and use its after-sales or refund option, or contact the seller through that order. Include the order number and describe the problem. Eligibility follows the order terms, platform rules and applicable consumer law." },
        { title: "Paddle purchases", text: "For purchases billed by Paddle, use the help link in your Paddle receipt or visit Paddle Buyer Support. Have your purchase email address and order reference available. Paddle applies its refund policy and any mandatory rights or deadlines that apply in your region.",
          links: [{ href: paymentSupport, label: "Request help from Paddle" }, { href: refundPolicy, label: "Read Paddle’s Refund Policy" }] },
        { title: "License and activation help", text: "For trouble redeeming a code or activating Pro, use the Feedback button on this site. If a purchase is refunded, access under the refunded license may be revoked." },
      ],
    },
  },
  zh: {
    "/terms": {
      title: "服务条款",
      intro: "本条款适用于 Book2Audio GO 官网和 Windows 应用，由 Book2AudioGo Group 提供。",
      sections: [
        { title: "软件使用许可", text: "Book2Audio GO 授予你使用本软件的有限许可。请仅转换你有权使用的书籍和文档，并遵守原始内容及生成音频适用的权利和限制。请勿绕过版权保护，或在未获必要授权的情况下分享音频。" },
        { title: "免费版与 Pro 授权", text: "免费版支持手动按章转换。Pro 功能包括批量转换和阅读计划。页面所示 Paddle Pro 方案为单台设备一次性授权，不自动续费。换机时，在账号页解绑原设备后再激活新设备。购买兑换码前，请核对商品页注明的有效期和使用条件。" },
        { title: "购买与支持", text: "目前可通过闲鱼购买兑换码。Paddle 结账开放后，通过 Paddle 下的订单由 Paddle 作为授权经销商处理，适用其买家条款。如需软件或授权支持，请使用本站的「留言与反馈」按钮。",
          links: [{ href: buyerTerms, label: "Paddle 买家条款" }] },
        { title: "第三方服务与消费者权益", text: "在线语音合成依赖所选服务商的可用性，部分格式需要文件中含有可提取的文本。适用法律赋予的消费者权利和保障继续有效。" },
      ],
    },
    "/privacy": {
      title: "隐私政策",
      intro: "本政策说明 Book2Audio GO 官网、账号服务和 Windows 应用如何处理数据。相关数据由 Book2AudioGo Group 处理。",
      sections: [
        { title: "书籍、文本与音频", text: "应用在你的设备上解析书籍和保存导出的音频。使用本地语音模型时，合成在你的设备上完成。使用在线语音合成时，转换所需的文本会发送给所选服务商处理。微软在线语音通过 Edge TTS 接收所选文本和语音参数。" },
        { title: "账号与授权", text: "我们处理用户名、邮箱、验证记录、设备激活信息和购买或兑换记录，用于登录、管理 Pro 授权和处理支持请求。验证码和密码重置邮件通过 Resend 发送。" },
        { title: "反馈与使用统计", text: "我们会保存你提交的留言及选填的邮箱、评分，用于处理和回复反馈，并使用网络信息限制滥用。网站统计可能包括大致地区、页面访问和下载记录。桌面端使用分析默认关闭，可在设置中开启。开启后会记录安装标识以及导入、转换和激活等事件，不包含书籍正文或文件路径。使用分析事件保存 90 天。" },
        { title: "支付与服务提供商", text: "Cloudflare 为官网和账号服务提供基础设施。闲鱼平台内的订单由闲鱼处理。通过 Paddle 下单时，Paddle 按其隐私政策处理付款和账单资料。我们使用交易编号和支付状态开通或更新授权。",
          links: [{ href: paddlePrivacy, label: "Paddle 隐私政策" }] },
        { title: "保存期限与隐私请求", text: "我们按提供服务、管理授权、响应请求、防止滥用及履行适用义务所需的期限保存信息。如需查询、更正或删除个人资料，请使用本站的「留言与反馈」按钮，并留下回复邮箱。" },
      ],
    },
    "/refunds": {
      title: "退款政策",
      intro: "请通过你购买 Book2Audio GO Pro 的渠道申请退款。",
      sections: [
        { title: "闲鱼兑换码", text: "打开闲鱼原订单，使用订单售后或退款入口，或通过该订单联系卖家。请提供订单号并说明问题。退款资格按订单约定、平台规则和适用的消费者保护法律处理。" },
        { title: "Paddle 订单", text: "如果订单由 Paddle 收款，请使用 Paddle 收据上的帮助链接，或访问 Paddle 买家支持。请准备购买时的邮箱和订单编号。Paddle 按其退款政策以及你所在地区适用的法定权利和期限处理申请。",
          links: [{ href: paymentSupport, label: "联系 Paddle 买家支持" }, { href: refundPolicy, label: "查看 Paddle 退款政策" }] },
        { title: "兑换与激活帮助", text: "如果遇到兑换或激活问题，请使用本站的「留言与反馈」按钮。订单退款后，对应的付费授权可能被撤销。" },
      ],
    },
  },
  ja: {
    "/terms": {
      title: "利用規約",
      intro: "Book2AudioGo Group が提供する Book2Audio GO のウェブサイトと Windows アプリに適用されます。",
      sections: [
        { title: "ライセンスとコンテンツ", text: "本ソフトウェアは定められた範囲で利用できます。利用する権利のある書籍や文書のみを変換し、原本および生成した音声に適用される権利を守ってください。コピー保護の回避や無断共有はできません。" },
        { title: "無料版と Pro", text: "無料版は章ごとの手動変換に対応します。Pro では一括変換と読書計画を利用できます。Paddle の Pro は、同時に1台で利用できる買い切りライセンスで、自動更新はありません。機種変更時はアカウントで旧端末の登録を解除してから新端末を有効化してください。引き換えコードの有効期間や条件は購入前に商品ページで確認してください。" },
        { title: "購入とサポート", text: "現在は閑魚（Xianyu）で引き換えコードを購入できます。Paddle 決済が開始された後、その取引には Paddle の購入者向け規約が適用されます。製品の問い合わせにはサイトのフィードバック機能をご利用ください。",
          links: [{ href: buyerTerms, label: "Paddle 購入者向け規約" }] },
        { title: "外部サービスと消費者の権利", text: "オンライン音声合成は選択したサービスの稼働状況に依存します。一部のファイル形式では抽出可能なテキストが必要です。法令で認められる消費者の権利は引き続き適用されます。" },
      ],
    },
    "/privacy": {
      title: "プライバシーポリシー",
      intro: "Book2AudioGo Group は、サイト、アカウントサービス、Windows アプリで以下のデータを取り扱います。",
      sections: [
        { title: "書籍、テキスト、音声", text: "書籍の解析と音声の保存は端末で行います。ローカルモデルでは端末内で音声を合成します。オンライン合成では選択したサービスに必要なテキストを送信します。Microsoft のオンライン音声は Edge TTS を通じて選択したテキストと音声設定を受け取ります。" },
        { title: "アカウントとライセンス", text: "ユーザー名、メールアドレス、認証記録、端末の有効化情報、購入や引き換えの記録を、ログイン、Pro の管理、サポートに使用します。認証メールとパスワード再設定メールは Resend が配信します。" },
        { title: "フィードバックと利用統計", text: "お問い合わせの内容と任意で入力されたメールアドレスや評価を保存します。不正防止にネットワーク情報を使います。サイトではおおよその地域、訪問やダウンロードを集計する場合があります。デスクトップ版の任意の分析は初期設定で無効です。有効にするとインストール識別子、インポート、変換、有効化などのイベントを90日間保存します。書籍本文やファイルパスは含みません。" },
        { title: "決済とサービス提供元", text: "Cloudflare はサイトとアカウントサービスの基盤を提供します。閑魚の注文は閑魚が扱います。Paddle は自社のポリシーに従って決済と請求情報を処理します。当方は取引IDと支払い状況をライセンス管理に使用します。",
          links: [{ href: paddlePrivacy, label: "Paddle のプライバシーポリシー" }] },
        { title: "保存とプライバシーに関する請求", text: "サービス提供、不正防止、サポートや法的義務に必要な期間、情報を保持します。開示、訂正、削除はこのページの連絡先からご請求いただけます。" },
      ],
    },
    "/refunds": {
      title: "返金ポリシー",
      intro: "Book2Audio GO Pro の返金は購入した窓口から申請してください。",
      sections: [
        { title: "閑魚の引き換えコード", text: "閑魚の元の注文から返金・アフターサービスを申請するか、出品者にご連絡ください。注文番号と問題の内容をご用意ください。注文時の条件、プラットフォームの規則、適用法に従います。" },
        { title: "Paddle の注文", text: "Paddle の領収書に記載されたリンク、または購入者向けサポートから申請できます。購入時のメールアドレスと注文番号をご用意ください。Paddle の返金ポリシーと地域の法定要件が適用されます。",
          links: [{ href: paymentSupport, label: "Paddle に問い合わせる" }, { href: refundPolicy, label: "Paddle の返金ポリシー" }] },
        { title: "有効化に関するサポート", text: "コードや有効化に問題がある場合はフィードバック機能をご利用ください。返金された注文に対応するライセンスは取り消されることがあります。" },
      ],
    },
  },
  ko: {
    "/terms": {
      title: "이용약관",
      intro: "Book2AudioGo Group이 제공하는 Book2Audio GO 웹사이트와 Windows 앱에 적용됩니다.",
      sections: [
        { title: "소프트웨어 사용권", text: "이 소프트웨어는 정해진 범위에서 사용할 수 있습니다. 사용할 권한이 있는 도서와 문서만 변환하고 원본과 생성된 오디오에 적용되는 권리를 존중해 주세요. 복제 방지를 우회하거나 허가 없이 오디오를 공유하지 마세요." },
        { title: "무료 버전과 Pro", text: "무료 버전은 장별 수동 변환을 지원합니다. Pro는 일괄 변환과 독서 계획을 제공합니다. Paddle Pro는 한 번 결제하여 한 번에 기기 한 대에서 사용할 수 있으며 자동 갱신되지 않습니다. 기기를 바꿀 때는 계정에서 이전 기기를 해제한 뒤 새 기기를 활성화하세요. 교환 코드의 기간과 조건은 구매 전에 상품 설명을 확인하세요." },
        { title: "구매 및 지원", text: "현재는 셴위(闲鱼, Xianyu)에서 교환 코드를 살 수 있습니다. Paddle 결제가 시작되면 해당 주문에는 Paddle 구매자 약관이 적용됩니다. 제품 문의는 사이트의 피드백 버튼을 이용하세요.",
          links: [{ href: buyerTerms, label: "Paddle 구매자 약관" }] },
        { title: "외부 서비스 및 소비자 권리", text: "온라인 음성 합성은 선택한 서비스의 운영 상태에 따라 달라집니다. 일부 형식은 추출 가능한 텍스트가 필요합니다. 관련 법에 따른 소비자 권리는 계속 적용됩니다." },
      ],
    },
    "/privacy": {
      title: "개인정보 처리방침",
      intro: "Book2AudioGo Group은 웹사이트, 계정 서비스 및 Windows 앱에서 아래 정보를 처리합니다.",
      sections: [
        { title: "도서, 텍스트 및 오디오", text: "도서 분석과 오디오 저장은 기기에서 이루어집니다. 로컬 모델은 기기에서 음성을 합성합니다. 온라인 합성을 선택하면 변환에 필요한 텍스트가 해당 서비스로 전송됩니다. Microsoft 온라인 음성에는 Edge TTS를 통해 선택한 텍스트와 음성 설정이 전송됩니다." },
        { title: "계정 및 사용권", text: "사용자 이름, 이메일, 인증 기록, 기기 활성화 정보, 구매 및 교환 기록을 로그인, Pro 관리와 지원에 사용합니다. 인증과 비밀번호 재설정 이메일은 Resend가 발송합니다." },
        { title: "피드백 및 사용 통계", text: "피드백과 선택 입력한 이메일 및 평점을 저장하며, 악용 방지를 위해 네트워크 정보를 사용합니다. 웹사이트 통계에는 대략적인 지역, 방문 및 다운로드가 포함될 수 있습니다. 데스크톱의 선택적 분석은 기본적으로 꺼져 있습니다. 켜면 설치 식별자와 가져오기, 변환, 활성화 등의 이벤트를 90일간 저장합니다. 도서 본문이나 파일 경로는 포함되지 않습니다." },
        { title: "결제 및 서비스 제공업체", text: "Cloudflare는 사이트와 계정 서비스의 인프라를 제공합니다. 셴위 주문은 셴위에서 처리합니다. Paddle 주문의 결제 및 청구 정보는 Paddle이 자체 방침에 따라 처리합니다. 당사는 사용권 관리를 위해 거래 ID와 결제 상태를 사용합니다.",
          links: [{ href: paddlePrivacy, label: "Paddle 개인정보 처리방침" }] },
        { title: "보관 및 개인정보 요청", text: "서비스 운영, 지원, 악용 방지 및 법적 의무 이행에 필요한 기간 동안 정보를 보관합니다. 열람, 수정 또는 삭제는 이 페이지의 연락처로 요청할 수 있습니다." },
      ],
    },
    "/refunds": {
      title: "환불 정책",
      intro: "Book2Audio GO Pro를 구매한 경로에서 환불을 신청해 주세요.",
      sections: [
        { title: "셴위 교환 코드", text: "셴위의 원래 주문에서 환불이나 사후 지원을 요청하거나 해당 주문을 통해 판매자에게 연락하세요. 주문 번호와 문제를 알려 주세요. 주문 조건, 플랫폼 규정 및 관련 소비자 보호법이 적용됩니다." },
        { title: "Paddle 주문", text: "Paddle 영수증의 도움말 링크 또는 Paddle 구매자 지원을 이용하세요. 구매 이메일과 주문 번호를 준비하세요. Paddle 환불 정책과 해당 지역의 법정 권리 및 기한이 적용됩니다.",
          links: [{ href: paymentSupport, label: "Paddle 구매자 지원" }, { href: refundPolicy, label: "Paddle 환불 정책" }] },
        { title: "활성화 지원", text: "교환 또는 활성화에 문제가 있으면 사이트의 피드백 버튼을 이용하세요. 환불된 주문의 사용권은 취소될 수 있습니다." },
      ],
    },
  },
  fr: {
    "/terms": {
      title: "Conditions d’utilisation",
      intro: "Ces conditions s’appliquent au site et à l’application Windows Book2Audio GO, fournis par Book2AudioGo Group.",
      sections: [
        { title: "Licence du logiciel", text: "Vous disposez d’une licence limitée d’utilisation du logiciel. Convertissez uniquement les livres et documents que vous êtes autorisé à utiliser. Respectez les droits applicables à la source et à l’audio produit. Ne contournez pas les protections et ne partagez pas l’audio sans autorisation." },
        { title: "Éditions gratuite et Pro", text: "L’édition gratuite permet la conversion manuelle par chapitre. Pro inclut la conversion par lots et le programme de lecture. L’offre Paddle est un achat unique pour un seul appareil actif, sans renouvellement automatique. Pour changer d’appareil, dissociez l’ancien dans votre compte avant d’activer le nouveau. Vérifiez la durée et les conditions des codes sur l’annonce avant l’achat." },
        { title: "Achat et assistance", text: "Les codes sont actuellement vendus sur Xianyu (闲鱼). Une fois le paiement Paddle disponible, ses conditions d’achat s’appliqueront aux commandes traitées par Paddle. Pour obtenir de l’aide, utilisez le bouton de commentaires du site.",
          links: [{ href: buyerTerms, label: "Conditions d’achat de Paddle" }] },
        { title: "Services tiers et droits des consommateurs", text: "La synthèse vocale en ligne dépend du service choisi. Certains formats exigent du texte extractible. Les garanties et droits légaux applicables restent en vigueur." },
      ],
    },
    "/privacy": {
      title: "Politique de confidentialité",
      intro: "Book2AudioGo Group traite les données ci-dessous pour le site, le service de compte et l’application Windows.",
      sections: [
        { title: "Livres, texte et audio", text: "Les livres sont analysés et l’audio exporté est enregistré sur votre appareil. Un modèle local synthétise la voix sur place. La synthèse en ligne transmet le texte nécessaire au service choisi. Les voix Microsoft en ligne reçoivent le texte sélectionné et les réglages vocaux via Edge TTS." },
        { title: "Comptes et licences", text: "Le nom d’utilisateur, l’adresse e-mail, les données de vérification, les activations et les achats ou échanges servent à gérer les connexions, les licences Pro et l’assistance. Resend achemine les e-mails de vérification et de réinitialisation du mot de passe." },
        { title: "Commentaires et statistiques", text: "Nous conservons vos messages, ainsi que l’adresse e-mail ou la note facultative. Des données réseau servent à prévenir les abus. Les statistiques du site peuvent inclure la région approximative, les visites et les téléchargements. L’analyse facultative de l’application est désactivée par défaut. Si activée, elle conserve pendant 90 jours un identifiant d’installation et des événements d’importation, de conversion et d’activation. Elle exclut le contenu des livres et les chemins de fichiers." },
        { title: "Paiements et prestataires", text: "Cloudflare fournit l’infrastructure du site et des comptes. Xianyu traite ses propres commandes. Paddle gère les données de règlement et de facturation selon sa politique. Nous utilisons l’identifiant et l’état de la transaction pour gérer la licence.",
          links: [{ href: paddlePrivacy, label: "Politique de confidentialité de Paddle" }] },
        { title: "Conservation et demandes", text: "Nous conservons les données le temps nécessaire au fonctionnement du service, à l’assistance, à la prévention des abus et au respect des obligations légales. Pour demander l’accès, la rectification ou la suppression de données, utilisez le contact sur cette page." },
      ],
    },
    "/refunds": {
      title: "Politique de remboursement",
      intro: "Demandez le remboursement de Book2Audio GO Pro auprès du canal utilisé pour votre achat.",
      sections: [
        { title: "Codes Xianyu", text: "Ouvrez la commande d’origine sur Xianyu et demandez un remboursement ou de l’assistance. Vous pouvez aussi contacter le vendeur depuis la commande. Indiquez la référence et le problème. Les conditions de la commande, les règles de la plateforme et le droit applicable déterminent votre éligibilité." },
        { title: "Commandes Paddle", text: "Utilisez le lien d’aide sur votre reçu Paddle ou contactez l’assistance aux acheteurs. Munissez-vous de l’adresse e-mail d’achat et de la référence de commande. Paddle applique sa politique et les droits et délais légaux de votre région.",
          links: [{ href: paymentSupport, label: "Contacter Paddle" }, { href: refundPolicy, label: "Politique de remboursement de Paddle" }] },
        { title: "Aide à l’activation", text: "En cas de problème avec un code ou l’activation de Pro, utilisez le bouton de commentaires du site. La licence liée à un achat remboursé peut être révoquée." },
      ],
    },
  },
  es: {
    "/terms": {
      title: "Términos del servicio",
      intro: "Estos términos se aplican al sitio web y la aplicación de Windows de Book2Audio GO, ofrecidos por Book2AudioGo Group.",
      sections: [
        { title: "Licencia de software", text: "Se concede una licencia limitada para usar el software. Convierte solo libros y documentos que tengas derecho a utilizar. Respeta los derechos del material original y del audio generado. No eludas la protección anticopia ni compartas el audio sin los permisos necesarios." },
        { title: "Versión gratuita y Pro", text: "La versión gratuita permite convertir capítulos manualmente. Pro incluye conversión por lotes y un plan de lectura. La oferta de Paddle es un pago único para un dispositivo activo, sin renovación automática. Para cambiar de equipo, desvincula el anterior en tu cuenta y activa el nuevo. Consulta la duración y las condiciones de cada código en su anuncio antes de comprar." },
        { title: "Compras y asistencia", text: "Los códigos se venden actualmente en Xianyu (闲鱼). Cuando se habilite el pago con Paddle, sus condiciones para compradores se aplicarán a los pedidos tramitados por Paddle. Puedes solicitar ayuda a través del botón de comentarios del sitio.",
          links: [{ href: buyerTerms, label: "Condiciones para compradores de Paddle" }] },
        { title: "Servicios externos y derechos del consumidor", text: "La síntesis de voz en línea depende de la disponibilidad del servicio elegido. Algunos formatos requieren texto extraíble. Se mantienen las garantías y los derechos legales aplicables." },
      ],
    },
    "/privacy": {
      title: "Política de privacidad",
      intro: "Book2AudioGo Group trata los datos indicados a continuación para el sitio, el servicio de cuentas y la aplicación de Windows.",
      sections: [
        { title: "Libros, texto y audio", text: "Los libros se analizan y el audio exportado se guarda en tu dispositivo. Con un modelo local, la voz se genera en el dispositivo. La síntesis en línea envía el texto necesario al servicio elegido. Las voces en línea de Microsoft reciben el texto seleccionado y los ajustes de voz a través de Edge TTS." },
        { title: "Cuentas y licencias", text: "Tratamos el nombre de usuario, el correo electrónico, los datos de verificación, las activaciones de dispositivos y los registros de compra o canje para gestionar el acceso, la licencia Pro y la asistencia. Resend envía los correos de verificación y de restablecimiento de contraseña." },
        { title: "Comentarios y estadísticas", text: "Guardamos tus mensajes y el correo y la valoración opcionales. Utilizamos datos de red para prevenir abusos. Las estadísticas del sitio pueden incluir la región aproximada, las visitas y las descargas. Los análisis opcionales de la aplicación están desactivados por defecto. Al activarlos, guardamos durante 90 días un identificador de instalación y eventos como importaciones, conversiones y activaciones. No incluyen el contenido de los libros ni rutas de archivos." },
        { title: "Pagos y proveedores", text: "Cloudflare facilita la infraestructura del sitio y de las cuentas. Xianyu tramita sus propios pedidos. Paddle trata los datos de pago y facturación según su política. Utilizamos el identificador y el estado de la transacción para gestionar la licencia.",
          links: [{ href: paddlePrivacy, label: "Política de privacidad de Paddle" }] },
        { title: "Conservación y solicitudes", text: "Conservamos los datos durante el tiempo necesario para prestar el servicio, atender solicitudes, evitar abusos y cumplir nuestras obligaciones. Puedes solicitar acceso, corrección o eliminación mediante el contacto de esta página." },
      ],
    },
    "/refunds": {
      title: "Política de reembolso",
      intro: "Solicita el reembolso de Book2Audio GO Pro en el canal donde lo compraste.",
      sections: [
        { title: "Códigos de Xianyu", text: "Abre el pedido original en Xianyu, solicita un reembolso o asistencia, o contacta al vendedor desde el pedido. Indica el número de pedido y el problema. Se aplican las condiciones del pedido, las normas de la plataforma y la legislación de consumo aplicable." },
        { title: "Pedidos de Paddle", text: "Utiliza el enlace de ayuda del recibo o el servicio de asistencia al comprador de Paddle. Ten a mano el correo de compra y la referencia del pedido. Se aplican la política de Paddle y los derechos y plazos legales de tu región.",
          links: [{ href: paymentSupport, label: "Contactar con Paddle" }, { href: refundPolicy, label: "Política de reembolso de Paddle" }] },
        { title: "Ayuda para activar la licencia", text: "Si tienes problemas para canjear un código o activar Pro, usa el botón de comentarios del sitio. La licencia asociada a un pedido reembolsado puede revocarse." },
      ],
    },
  },
};
