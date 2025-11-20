'use client';

import { useState } from 'react';
import { IoSend, IoCheckmarkDone } from 'react-icons/io5';

interface NotificationResult {
  success: boolean;
  message?: string;
  error?: string;
  messageId?: string;
  timestamp?: string;
}

export default function NotifikasiWAPage() {
  const [phoneNumber, setPhoneNumber] = useState<string>('62');
  const [messageBody, setMessageBody] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<NotificationResult | null>(null);
  const [messageType, setMessageType] = useState<
    'custom' | 'alert' | 'screening' | 'verification'
  >('custom');
  const [riskData, setRiskData] = useState<{
    disease: string;
    riskScore: number;
  }[]>([{ disease: 'Hipertensi', riskScore: 75 }]);
  const [severity, setSeverity] = useState<'critical' | 'high' | 'medium'>(
    'high'
  );

  const generateAlertMessage = () => {
    const severityLabel =
      severity === 'critical'
        ? '⛔ KRITIS'
        : severity === 'high'
          ? '🔴 TINGGI'
          : '🟡 SEDANG';

    const diseaseList = riskData.map((d) => `• ${d.disease}: ${d.riskScore}%`).join('\n');

    return `
${severityLabel} *ALERT KESEHATAN ANDA*

Risiko Penyakit Terdeteksi:
${diseaseList}

⚠️ *Segera lakukan:*
• Konsultasi dengan dokter
• Lakukan pemeriksaan kesehatan
• Ikuti rekomendasi screening

🔗 Buka aplikasi MedpredictJKN untuk detail lengkap

---
MedpredictJKN - Sistem Prediksi Risiko Penyakit
    `.trim();
  };

  const generateVerificationMessage = () => {
    const code = Math.random().toString().slice(2, 8);
    return `Kode verifikasi MedpredictJKN Anda: *${code}*\n\nJangan bagikan kode ini kepada siapapun.`;
  };

  const sendNotification = async () => {
    if (!phoneNumber || phoneNumber === '62') {
      alert('Masukkan nomor WhatsApp yang valid');
      return;
    }

    let finalMessage = messageBody;

    if (messageType === 'alert') {
      finalMessage = generateAlertMessage();
    } else if (messageType === 'verification') {
      finalMessage = generateVerificationMessage();
    }

    if (!finalMessage) {
      alert('Masukkan pesan terlebih dahulu');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/notify-wa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phoneNumber,
          body: finalMessage,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: 'Pesan berhasil dikirim!',
          messageId: data.message?.id,
          timestamp: new Date().toISOString(),
        });
        setMessageBody('');
      } else {
        setResult({
          success: false,
          error: data.error || 'Gagal mengirim pesan',
        });
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Terjadi kesalahan',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            📱 Notifikasi WhatsApp
          </h1>
          <p className="text-gray-600">
            Kirim notifikasi kesehatan melalui WhatsApp dengan WhAPI.cloud
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              {/* Message Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  📋 Tipe Notifikasi
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { value: 'custom', label: 'Custom' },
                    { value: 'alert', label: 'Alert Risiko' },
                    { value: 'screening', label: 'Screening' },
                    { value: 'verification', label: 'Verifikasi' },
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() =>
                        setMessageType(
                          type.value as
                            | 'custom'
                            | 'alert'
                            | 'screening'
                            | 'verification'
                        )
                      }
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        messageType === type.value
                          ? 'bg-green-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Severity Selection (for alert type) */}
              {messageType === 'alert' && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    ⚠️ Tingkat Keparahan
                  </label>
                  <div className="flex gap-2">
                    {['critical', 'high', 'medium'].map((sev) => (
                      <button
                        key={sev}
                        onClick={() =>
                          setSeverity(sev as 'critical' | 'high' | 'medium')
                        }
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          severity === sev
                            ? 'bg-red-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {sev === 'critical'
                          ? '🔴 KRITIS'
                          : sev === 'high'
                            ? '🟠 TINGGI'
                            : '🟡 SEDANG'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk Data (for alert type) */}
              {messageType === 'alert' && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    🏥 Data Risiko Penyakit
                  </label>
                  {riskData.map((risk, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={risk.disease}
                        onChange={(e) => {
                          const newData = [...riskData];
                          newData[idx].disease = e.target.value;
                          setRiskData(newData);
                        }}
                        placeholder="Nama penyakit"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="number"
                        value={risk.riskScore}
                        onChange={(e) => {
                          const newData = [...riskData];
                          newData[idx].riskScore = parseInt(e.target.value);
                          setRiskData(newData);
                        }}
                        placeholder="Skor %"
                        min="0"
                        max="100"
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      setRiskData([
                        ...riskData,
                        { disease: '', riskScore: 0 },
                      ])
                    }
                    className="text-sm text-green-600 hover:text-green-700 font-medium mt-2"
                  >
                    + Tambah Penyakit
                  </button>
                </div>
              )}

              {/* Phone Number */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📞 Nomor WhatsApp Tujuan
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-600">
                    🇮🇩
                  </span>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, '');
                      if (!val.startsWith('62')) {
                        val = '62' + val;
                      }
                      setPhoneNumber(val);
                    }}
                    placeholder="62xxxxxxxxxx"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Format: 62 + nomor (tanpa 0 di awal)
                </p>
              </div>

              {/* Message Body */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  💬 Isi Pesan
                </label>
                <textarea
                  value={
                    messageType === 'alert'
                      ? generateAlertMessage()
                      : messageType === 'verification'
                        ? generateVerificationMessage()
                        : messageBody
                      }
                  onChange={(e) => setMessageBody(e.target.value)}
                  placeholder="Tulis pesan WhatsApp Anda di sini..."
                  rows={8}
                  disabled={messageType !== 'custom'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:text-gray-600"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Karakter: {messageType === 'custom' ? messageBody.length : generateAlertMessage().length}
                </p>
              </div>

              {/* Send Button */}
              <button
                onClick={sendNotification}
                disabled={loading}
                className="w-full bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <IoSend className="text-xl" />
                {loading ? 'Mengirim...' : 'Kirim Notifikasi'}
              </button>
            </div>
          </div>

          {/* Result Section */}
          <div>
            {/* API Status Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="font-bold text-gray-800 mb-4">🔌 Status API</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-700">WhAPI Connected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-700">Database Ready</span>
                </div>
              </div>
            </div>

            {/* Result Card */}
            {result && (
              <div
                className={`bg-white rounded-lg shadow-lg p-6 ${
                  result.success ? 'border-2 border-green-500' : 'border-2 border-red-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <IoCheckmarkDone className="text-2xl text-green-500 shrink-0" />
                  ) : (
                    <div className="text-2xl shrink-0">❌</div>
                  )}
                  <div className="flex-1">
                    <h4
                      className={`font-bold mb-2 ${
                        result.success ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      {result.success ? 'Berhasil!' : 'Gagal!'}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {result.message || result.error}
                    </p>
                    {result.messageId && (
                      <div className="bg-gray-50 p-3 rounded text-xs text-gray-700 break-all">
                        <strong>ID:</strong> {result.messageId}
                      </div>
                    )}
                    {result.timestamp && (
                      <p className="text-xs text-gray-500 mt-3">
                        {new Date(result.timestamp).toLocaleString('id-ID')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Info Card */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-bold text-blue-900 mb-3">ℹ️ Informasi</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>✓ Gunakan format nomor 62</li>
                <li>✓ Pastikan nomor terdaftar WhatsApp</li>
                <li>✓ API WhAPI.cloud aktif</li>
                <li>✓ Pesan real-time terkirim</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
