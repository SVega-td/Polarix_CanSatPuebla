using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using CanSat_Tecnm.Hubs;
using CanSat_Tecnm.Models;
using System.Threading.Tasks;

namespace CanSat_Tecnm.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TelemetriaController : Controller
    {
        private readonly IHubContext<TelemetriaHub> _hubContext;

        // Inyectamos el Hub para poder enviar datos a la vista de MVC de forma instantánea
        public TelemetriaController(IHubContext<TelemetriaHub> hubContext)
        {
            _hubContext = hubContext;
        }

        [HttpPost]
        public async Task<IActionResult> RecibirDatos([FromBody] Telemetria datos)
        {
            // Opcional: Aquí puedes agregar el código para guardar en 'ApplicationDbContext' si deseas mantener un registro histórico

            // Transmitir los datos a todos los clientes web conectados bajo el evento "RecibirTelemetria"
            await _hubContext.Clients.All.SendAsync("RecibirTelemetria", datos);

            return Ok(new { status = "success" });
        }
    }
}