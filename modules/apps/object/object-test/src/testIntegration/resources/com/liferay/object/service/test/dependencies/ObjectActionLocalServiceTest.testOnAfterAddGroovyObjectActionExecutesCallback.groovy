import com.liferay.object.model.ObjectEntry
import com.liferay.object.model.ObjectDefinition
import com.liferay.object.service.ObjectDefinitionLocalServiceUtil
import com.liferay.object.service.ObjectEntryLocalServiceUtil
import com.liferay.portal.kernel.log.LogFactoryUtil
import com.liferay.portal.kernel.util.LocaleUtil

def log = LogFactoryUtil.getLog("GROOVY_ACTION")

try {
	log.info("ID: " + id)
	log.info("______________________________________________________________________")

	ObjectEntry objectEntry = ObjectEntryLocalServiceUtil.getObjectEntry(id)
	ObjectDefinition objectDefinition = ObjectDefinitionLocalServiceUtil.getObjectDefinition(objectEntry.getObjectDefinitionId())

	def pluralName = objectDefinition.getPluralLabel(LocaleUtil.getDefault())
	log.info("Using pluralName: " + pluralName)

	def url = "http://localhost:8080/o/c/${pluralName}/${id}"
	def connection = new URL(url).openConnection()
	connection.setRequestMethod("GET")

	def response = connection.inputStream.text
	println response
} catch (Exception e) {
	log.error("An error occurred:", e)
} finally {
	log.info("______________________________________________________________________")
	log.info("End of script")
}