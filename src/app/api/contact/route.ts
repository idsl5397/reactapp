import { NextRequest, NextResponse } from "next/server";
import nodemailer from 'nodemailer';

interface SMTPEmail {
    SmtpServer: string;
    SmtpPort: number;
    SmtpUsername: string;
    SmtpPassword: string;
    FromEmail: string;
    FromName: string;
    EnableSsl: boolean;
}

interface ContactFormData {
    name: string;
    email: string;
    organization: string;
    subject: string;
    message: string;
    category: string;
    timestamp: string;
}

export async function POST(request: NextRequest) {
    try {
        // 解析請求資料
        const body: ContactFormData = await request.json();
        const { name, email, organization, subject, message, category, timestamp } = body;

        // 表單驗證
        if (!name || !email || !organization || !subject || !message) {
            return NextResponse.json(
                { success: false, message: '所有必填欄位都必須填寫' },
                { status: 400 }
            );
        }

        // Email 格式驗證
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, message: '請提供有效的電子郵件地址' },
                { status: 400 }
            );
        }

        const adminEmail: string = "idsl5397@mail.isha.org.tw";
        const setting: SMTPEmail = {
            SmtpServer: process.env.Email_Setting__SmtpServer||"mail.isha.org.tw",
            SmtpPort: Number(process.env.Email_Setting__SmtpPort)||25,
            SmtpUsername: process.env.Email_Setting__SmtpUsername||"isha_khh",
            SmtpPassword: process.env.Email_Setting__SmtpPassword||"Isha04861064",
            FromEmail: process.env.Email_Setting__FromEmail||"isha_khh@mail.isha.org.tw",
            FromName: process.env.Email_Setting__FromName||"績效指標資料庫平台-使用者建議",
            EnableSsl: false
        };

        // 建立 nodemailer transporter
        const transporter = nodemailer.createTransport({
            host: setting.SmtpServer,
            port: setting.SmtpPort,
            secure: setting.EnableSsl, // true for 465, false for other ports
            auth: {
                user: setting.SmtpUsername,
                pass: setting.SmtpPassword,
            },
            tls: {
                // 如果使用自簽證書，可能需要這個設定
                rejectUnauthorized: false
            }
        });

        // 驗證 SMTP 連線
        try {
            await transporter.verify();
        } catch (error) {
            console.error('SMTP 連線驗證失敗:', error);
            return NextResponse.json(
                { success: false, message: '郵件系統暫時無法使用，請稍後再試' },
                { status: 500 }
            );
        }

        // 問題類別的中文對應
        const categoryMap: Record<string, string> = {
            'general': '一般詢問',
            'technical': '技術支援',
            'account': '帳號問題',
            'report': '報告相關',
            'tracking': '問題追蹤相關',
            'suggestion': '建議與回饋'
        };

        const categoryText = categoryMap[category] || category;

        // 準備郵件內容
        const mailOptions = {
            from: `"${setting.FromName}" <${setting.FromEmail}>`,
            to: adminEmail,
            subject: `[${categoryText}] ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
                        績效指標資料庫平台 - 新訊息
                    </h2>
                    
                    <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
                        <h3 style="color: #495057; margin-top: 0;">聯絡資訊</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; color: #495057; width: 120px;">姓名：</td>
                                <td style="padding: 8px 0; color: #212529;">${name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; color: #495057;">電子郵件：</td>
                                <td style="padding: 8px 0; color: #212529;">
                                    <a href="mailto:${email}" style="color: #007bff; text-decoration: none;">${email}</a>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; color: #495057;">單位/組織：</td>
                                <td style="padding: 8px 0; color: #212529;">${organization}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; color: #495057;">問題類別：</td>
                                <td style="padding: 8px 0;">
                                    <span style="background-color: #007bff; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px;">
                                        ${categoryText}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; color: #495057;">主旨：</td>
                                <td style="padding: 8px 0; color: #212529;">${subject}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; color: #495057;">提交時間：</td>
                                <td style="padding: 8px 0; color: #6c757d; font-size: 14px;">
                                    ${new Date(timestamp).toLocaleString('zh-TW')}
                                </td>
                            </tr>
                        </table>
                    </div>

                    <div style="margin: 20px 0;">
                        <h3 style="color: #495057; margin-bottom: 10px;">訊息內容</h3>
                        <div style="background-color: #ffffff; border: 1px solid #dee2e6; border-radius: 5px; padding: 15px; white-space: pre-wrap; line-height: 1.5; color: #212529;">
${message}
                        </div>
                    </div>

                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d; font-size: 12px;">
                        <p>此郵件由績效指標資料庫平台自動發送</p>
                        <p>請勿直接回覆此郵件，如需回覆請直接聯絡 ${email}</p>
                    </div>
                </div>
            `,
            // 也提供純文字版本
            text: `
績效指標資料庫平台 - 新訊息

聯絡資訊：
姓名：${name}
電子郵件：${email}
單位/組織：${organization}
問題類別：${categoryText}
主旨：${subject}
提交時間：${new Date(timestamp).toLocaleString('zh-TW')}

訊息內容：
${message}

---
此郵件由績效指標資料庫平台自動發送
請勿直接回覆此郵件，如需回覆請直接聯絡 ${email}
            `
        };

        // 發送郵件
        const info = await transporter.sendMail(mailOptions);
        // console.log('郵件發送成功:', info.messageId);

        // 可選：發送確認郵件給用戶
        const confirmationMailOptions = {
            from: `"${setting.FromName}" <${setting.FromEmail}>`,
            to: email,
            subject: '感謝您的聯絡 - 績效指標資料庫平台',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #333; border-bottom: 2px solid #28a745; padding-bottom: 10px;">
                        感謝您的聯絡
                    </h2>
                    
                    <p>親愛的 ${name}，</p>
                    
                    <p>我們已收到您的訊息，感謝您與我們聯絡。</p>
                    
                    <div style="margin: 20px 0; padding: 15px; background-color: #d4edda; border-left: 4px solid #28a745; border-radius: 4px;">
                        <h4 style="margin-top: 0; color: #155724;">您的訊息摘要：</h4>
                        <p><strong>主旨：</strong> ${subject}</p>
                        <p><strong>類別：</strong> ${categoryText}</p>
                        <p><strong>提交時間：</strong> ${new Date(timestamp).toLocaleString('zh-TW')}</p>
                    </div>
                    
                    <p>我們的專業團隊將盡快處理您的請求，並會透過此電子郵件地址回覆您。</p>
                    
                    <p>如果您有任何緊急問題，請撥打我們的服務專線：<strong>(07) 550-3115</strong></p>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 14px;">
                        <p>此為系統自動發送的確認郵件，請勿直接回覆。</p>
                        <p style="margin: 0;">
                            <strong>中華民國工業安全衛生協會-高雄安環技術處</strong><br>
                            地址：高雄市左營區博愛三路12號15樓<br>
                            電話：(07) 550-3115
                        </p>
                    </div>
                </div>
            `
        };

        // 發送確認郵件（如果失敗不影響主要流程）
        try {
            await transporter.sendMail(confirmationMailOptions);
            // console.log('確認郵件發送成功');
        } catch (confirmError) {
            console.warn('確認郵件發送失敗:', confirmError);
            // 不拋出錯誤，因為主要郵件已發送成功
        }

        return NextResponse.json({
            success: true,
            message: '您的訊息已成功送出，我們將盡快回覆您'
        });

    } catch (error) {
        console.error('處理聯絡表單時發生錯誤:', error);

        return NextResponse.json(
            {
                success: false,
                message: '系統發生錯誤，請稍後再試或直接聯絡我們的服務專線'
            },
            { status: 500 }
        );
    }
}
